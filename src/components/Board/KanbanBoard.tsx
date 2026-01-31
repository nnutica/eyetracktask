'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import type { Task, Project, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import BoardHeader from './BoardHeader';
import StatusColumn from './StatusColumn';
import CreateProjectModal from '../Modal/CreateProjectModal';
import EditProjectModal from '../Modal/EditProjectModal';
import CreateTaskModal from '../Modal/CreateTaskModal';
import EditTaskModal from '../Modal/EditTaskModal';
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects';

const statusColumns: { id: TaskStatus; label: string; count?: number }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Work' },
  { id: 'Review', label: 'Review' },
  { id: 'DONE', label: 'Done' },
];

// Initial empty project
const initialProject: Project = {
  id: '1',
  name: 'My Project',
  tasks: [],
};

export interface KanbanBoardHandle {
  openProjectModal: () => void;
  getProjects: () => Project[];
  getCurrentProjectId: () => string;
  switchProject: (projectId: string) => void;
  editProject: (project: Project) => void;
}

const KanbanBoard = forwardRef<KanbanBoardHandle>((props, ref) => {
  const [mounted, setMounted] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState('');
  const [newProjectIconFile, setNewProjectIconFile] = useState<File | null>(null);
  const [editProjectIconFile, setEditProjectIconFile] = useState<File | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('TODO');
  const [selectedCategory, setSelectedCategory] = useState('Dev');
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [optimisticProjects, setOptimisticProjects] = useState<Project[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  
  // Loading states for buttons
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  
  const {
    projects: supabaseProjects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    uploadProjectIcon,
    addTask,
    updateTask,
    deleteTask,
    addSubTask,
    updateSubTask,
    deleteSubTask,
  } = useSupabaseProjects();

  // Use optimistic state if available, otherwise use Supabase state
  const projects = optimisticProjects || supabaseProjects;

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (projects.length > 0 && !currentProjectId) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  // Emit event when projects or current project changes
  useEffect(() => {
    window.dispatchEvent(new Event('projectsUpdated'));
  }, [projects, currentProjectId]);

  // Expose openProjectModal to parent
  useImperativeHandle(ref, () => ({
    openProjectModal: () => setIsProjectModalOpen(true),
    getProjects: () => projects,
    getCurrentProjectId: () => currentProjectId,
    switchProject: (projectId: string) => setCurrentProjectId(projectId),
    editProject: (project: Project) => {
      setEditingProject(project);
      setIsEditProjectModalOpen(true);
    },
    getAllTasks: () => {
      return projects.flatMap(project => 
        project.tasks.map(task => ({
          task,
          projectName: project.name,
          projectId: project.id
        }))
      );
    },
    openTaskModal: (task: Task) => {
      setEditingTask(task);
      setIsEditModalOpen(true);
    },
  }));

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    const task = currentProject?.tasks.find(t => t.id === draggableId);
    
    if (task && task.status !== newStatus) {
      // Optimistic update - update UI immediately
      const updatedProjects = projects.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            tasks: p.tasks.map(t => 
              t.id === draggableId ? { ...t, status: newStatus } : t
            )
          };
        }
        return p;
      });
      setOptimisticProjects(updatedProjects);

      // Update in database in background (fire and forget)
      updateTask(draggableId, { status: newStatus }).catch(() => {
        // On error, revert optimistic state
        setOptimisticProjects(null);
      });
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !currentProject) return;

    setIsCreatingTask(true);
    
    // Calculate default due date (today + 7 days)
    const getDefaultDueDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    };
    
    const dueDate = newTaskDueDate || getDefaultDueDate();
    
    // Create optimistic task
    const optimisticTask: Task = {
      id: 'temp-' + Date.now(),
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      status: selectedStatus as TaskStatus,
      category: selectedCategory,
      dueDate: dueDate,
      subTasks: [],
    };

    // Optimistic update - show task immediately
    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          tasks: [...p.tasks, optimisticTask]
        };
      }
      return p;
    });
    setOptimisticProjects(updatedProjects);

    // Clear form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setIsModalOpen(false);

    // Actually create in database (fire and forget)
    addTask(
      currentProject.id,
      newTaskTitle,
      newTaskDescription,
      dueDate,
      selectedCategory
    ).then(() => {
      // Reset optimistic state once successful
      setOptimisticProjects(null);
    }).catch((error) => {
      console.error('Error creating task:', error);
      // Revert optimistic state on error
      setOptimisticProjects(null);
      alert('Failed to create task');
    }).finally(() => {
      setIsCreatingTask(false);
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreatingProject(true);

    // Create optimistic project
    const optimisticProject: Project = {
      id: 'temp-' + Date.now(),
      name: newProjectName,
      icon: newProjectIcon || undefined,
      tasks: [],
    };

    // Optimistic update - show project immediately
    setOptimisticProjects([...projects, optimisticProject]);
    setCurrentProjectId(optimisticProject.id);

    // Clear form
    setNewProjectName('');
    setNewProjectIcon('');
    setNewProjectIconFile(null);
    setIsProjectModalOpen(false);

    // Actually create in database (fire and forget)
    (async () => {
      try {
        let iconUrl = newProjectIcon;
        
        // Upload icon file if exists
        if (newProjectIconFile) {
          iconUrl = await uploadProjectIcon(newProjectIconFile);
        }

        const newProject = await createProject(newProjectName, iconUrl) as any;
        // Reset optimistic state once successful
        setOptimisticProjects(null);
      } catch (error) {
        console.error('Error creating project:', error);
        // Revert optimistic state on error
        setOptimisticProjects(null);
        alert('Failed to create project');
      } finally {
        setIsCreatingProject(false);
      }
    })();
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) return;

    setIsUpdatingProject(true);
    try {
      let iconUrl = editingProject.icon;
      
      // Upload icon file if exists
      if (editProjectIconFile) {
        iconUrl = await uploadProjectIcon(editProjectIconFile, editingProject.id);
      }

      await updateProject(editingProject.id, {
        name: editingProject.name,
        icon: iconUrl || null,
      });
      setIsEditProjectModalOpen(false);
      setEditingProject(null);
      setEditProjectIconFile(null);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!editingProject) return;
    if (projects.length === 1) {
      alert('Cannot delete the last project');
      return;
    }

    setIsDeletingProject(true);
    try {
      await deleteProject(editingProject.id);
      setIsEditProjectModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target?.result as string;
      if (isEdit && editingProject) {
        setEditingProject({ ...editingProject, icon: previewUrl });
        setEditProjectIconFile(file);
      } else {
        setNewProjectIcon(previewUrl);
        setNewProjectIconFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    setIsUpdatingTask(true);
    try {
      await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description || null,
        status: editingTask.status,
        due_date: editingTask.dueDate,
        category: editingTask.category,
      });
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;

    setIsDeletingTask(true);
    try {
      await deleteTask(editingTask.id);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleAddSubTask = async () => {
    if (!editingTask || !newSubTaskTitle.trim()) return;

    // Create optimistic subtask
    const optimisticSubTask = {
      id: 'temp-' + Date.now(),
      title: newSubTaskTitle,
      isCompleted: false,
    };

    // Optimistic update - add subtask immediately
    const updatedTask = {
      ...editingTask,
      subTasks: [...editingTask.subTasks, optimisticSubTask],
    };
    setEditingTask(updatedTask);

    // Clear input immediately
    const titleToAdd = newSubTaskTitle;
    setNewSubTaskTitle('');

    // Add to database in background
    try {
      await addSubTask(editingTask.id, titleToAdd);
      // Refresh editing task with real data
      const updatedProject = projects.find((p: Project) => p.id === currentProjectId);
      const refreshedTask = updatedProject?.tasks.find((t: Task) => t.id === editingTask.id);
      if (refreshedTask) {
        setEditingTask(refreshedTask);
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
      // Revert on error - remove optimistic subtask
      setEditingTask(editingTask);
      setNewSubTaskTitle(titleToAdd);
      alert('Failed to add subtask. Please try again.');
    }
  };

  const handleToggleSubTask = async (subTaskId: string) => {
    if (!editingTask) return;

    try {
      const subTask = editingTask.subTasks.find(st => st.id === subTaskId);
      if (subTask) {
        await updateSubTask(subTaskId, { is_completed: !subTask.isCompleted });
        setEditingTask({
          ...editingTask,
          subTasks: editingTask.subTasks.map(st =>
            st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
          ),
        });
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
      alert('Failed to update subtask');
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    if (!editingTask) return;

    try {
      await deleteSubTask(subTaskId);
      setEditingTask({
        ...editingTask,
        subTasks: editingTask.subTasks.filter(st => st.id !== subTaskId),
      });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      alert('Failed to delete subtask');
    }
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    if (!currentProject) return [];
    let filteredTasks = currentProject.tasks.filter((task: Task) => task.status === status);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter((task: Task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus && filterStatus !== status) {
      return [];
    }

    return filteredTasks;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status as TaskStatus | '');
  };

  return (
    <div className="flex h-screen flex-col bg-[#0F1115] p-6">
      <BoardHeader
        projectName={currentProject?.name || 'My Project'}
        isLoading={loading}
        onNewTask={() => setIsModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />

      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-950 border border-red-800 p-4">
          <p className="text-red-400 text-sm">
            <strong>Error loading projects:</strong> {error}
          </p>
          <p className="text-red-400 text-xs mt-2">
            💡 ถ้ายังไม่มี tables ใน Supabase ให้รันคำสั่ง SQL จากไฟล์ SUPABASE_SCHEMA.sql
          </p>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto">
          {statusColumns.map((column) => {
            const tasks = getTasksByStatus(column.id);
            return (
              <StatusColumn
                key={column.id}
                column={column}
                tasks={tasks}
                mounted={mounted}
                onTaskClick={handleTaskClick}
              />
            );
          })}
        </div>
      </DragDropContext>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setNewProjectName('');
          setNewProjectIcon('');
          setNewProjectIconFile(null);
        }}
        projectName={newProjectName}
        projectIcon={newProjectIcon}
        onProjectNameChange={setNewProjectName}
        onProjectIconChange={setNewProjectIcon}
        onIconUpload={(e) => handleIconUpload(e, false)}
        onCreate={handleCreateProject}
        isLoading={isCreatingProject}
      />

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => {
          setIsEditProjectModalOpen(false);
          setEditingProject(null);
          setEditProjectIconFile(null);
        }}
        project={editingProject}
        onProjectChange={setEditingProject}
        onIconUpload={(e) => handleIconUpload(e, true)}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
        isLoading={isUpdatingProject}
        isDeleting={isDeletingProject}
      />

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskTitle={newTaskTitle}
        taskDescription={newTaskDescription}
        taskDueDate={newTaskDueDate}
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        statusColumns={statusColumns}
        onTitleChange={setNewTaskTitle}
        onDescriptionChange={setNewTaskDescription}
        onDueDateChange={setNewTaskDueDate}
        onStatusChange={setSelectedStatus}
        onCategoryChange={setSelectedCategory}
        onCreate={handleCreateTask}
        isLoading={isCreatingTask}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        statusColumns={statusColumns}
        newSubTaskTitle={newSubTaskTitle}
        onTaskChange={setEditingTask}
        onSubTaskTitleChange={setNewSubTaskTitle}
        onAddSubTask={handleAddSubTask}
        onToggleSubTask={handleToggleSubTask}
        onDeleteSubTask={handleDeleteSubTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        isLoading={isUpdatingTask}
        isDeleting={isDeletingTask}
      />
    </div>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;
