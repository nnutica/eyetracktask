'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import type { Task, Project, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import BoardHeader from './BoardHeader';
import StatusColumn from './StatusColumn';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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
  const [projects, setProjects] = useLocalStorage<Project[]>('eyetracktask-projects', [initialProject]);
  const [currentProjectId, setCurrentProjectId] = useLocalStorage<string>('eyetracktask-current-project', '1');
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
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('TODO');
  const [selectedCategory, setSelectedCategory] = useState('Dev');
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

  const updateCurrentProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    // Trigger custom event for RightPanel to refresh
    window.dispatchEvent(new Event('taskUpdated'));
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

    const newTasks: Task[] = Array.from(currentProject.tasks);
    const taskIndex = newTasks.findIndex((t: Task) => t.id === draggableId);
    const [movedTask] = newTasks.splice(taskIndex, 1);
    movedTask.status = destination.droppableId as TaskStatus;

    // Re-insert at the correct position
    const destTasks = newTasks.filter((t: Task) => t.status === destination.droppableId);
    const otherTasks = newTasks.filter((t: Task) => t.status !== destination.droppableId);
    destTasks.splice(destination.index, 0, movedTask);

    updateCurrentProject({ ...currentProject, tasks: [...otherTasks, ...destTasks] });
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      status: selectedStatus,
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
      category: selectedCategory,
      subTasks: [],
    };

    updateCurrentProject({ ...currentProject, tasks: [...currentProject.tasks, newTask] });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setIsModalOpen(false);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      icon: newProjectIcon,
      tasks: [],
    };

    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
    setNewProjectName('');
    setNewProjectIcon('');
    setIsProjectModalOpen(false);
    
    // Trigger custom event for RightPanel to refresh
    window.dispatchEvent(new Event('taskUpdated'));
  };

  const handleUpdateProject = () => {
    if (!editingProject || !editingProject.name.trim()) return;

    setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
    setIsEditProjectModalOpen(false);
    setEditingProject(null);
    
    // Trigger custom event for RightPanel to refresh
    window.dispatchEvent(new Event('taskUpdated'));
  };

  const handleDeleteProject = () => {
    if (!editingProject) return;
    if (projects.length === 1) {
      alert('Cannot delete the last project');
      return;
    }

    const updatedProjects = projects.filter(p => p.id !== editingProject.id);
    setProjects(updatedProjects);
    
    // Switch to first project if current is deleted
    if (currentProjectId === editingProject.id) {
      setCurrentProjectId(updatedProjects[0].id);
    }
    
    // Trigger custom event for RightPanel to refresh
    window.dispatchEvent(new Event('taskUpdated'));
    
    setIsEditProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isEdit && editingProject) {
        setEditingProject({ ...editingProject, icon: base64 });
      } else {
        setNewProjectIcon(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    const updatedTasks = currentProject.tasks.map(t => 
      t.id === editingTask.id ? editingTask : t
    );
    updateCurrentProject({ ...currentProject, tasks: updatedTasks });
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;

    const updatedTasks = currentProject.tasks.filter(t => t.id !== editingTask.id);
    updateCurrentProject({ ...currentProject, tasks: updatedTasks });
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleAddSubTask = () => {
    if (!editingTask || !newSubTaskTitle.trim()) return;

    const newSubTask = {
      id: Date.now().toString(),
      title: newSubTaskTitle,
      isCompleted: false,
    };

    setEditingTask({
      ...editingTask,
      subTasks: [...editingTask.subTasks, newSubTask],
    });
    setNewSubTaskTitle('');
  };

  const handleToggleSubTask = (subTaskId: string) => {
    if (!editingTask) return;

    const updatedSubTasks = editingTask.subTasks.map(st =>
      st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    setEditingTask({
      ...editingTask,
      subTasks: updatedSubTasks,
    });
  };

  const handleDeleteSubTask = (subTaskId: string) => {
    if (!editingTask) return;

    const updatedSubTasks = editingTask.subTasks.filter(st => st.id !== subTaskId);

    setEditingTask({
      ...editingTask,
      subTasks: updatedSubTasks,
    });
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return currentProject.tasks.filter((task: Task) => task.status === status);
  };

  return (
    <div className="flex h-screen flex-col bg-[#0F1115] p-6">
      <BoardHeader
        projectName={currentProject?.name || 'My Project'}
        isLoading={!mounted}
        onNewTask={() => setIsModalOpen(true)}
      />

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

      {/* Create Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => {
        setIsProjectModalOpen(false);
        setNewProjectName('');
        setNewProjectIcon('');
      }} title="Create New Project">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Project Name</label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Project Icon (Optional)</label>
            <div className="flex items-center gap-3">
              {newProjectIcon && (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-800 overflow-hidden">
                  <img src={newProjectIcon} alt="Icon" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-[#0F1115] px-4 py-3 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload Icon
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIconUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Or use emoji: 🚀 📊 💼 🎨</p>
            <input
              type="text"
              value={newProjectIcon}
              onChange={(e) => setNewProjectIcon(e.target.value)}
              placeholder="Or paste emoji or URL..."
              className="mt-2 w-full rounded-lg bg-[#0F1115] px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => {
              setIsProjectModalOpen(false);
              setNewProjectName('');
              setNewProjectIcon('');
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProject}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal 
        isOpen={isEditProjectModalOpen} 
        onClose={() => {
          setIsEditProjectModalOpen(false);
          setEditingProject(null);
        }} 
        title="Edit Project"
      >
        {editingProject && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Project Name</label>
              <input
                type="text"
                value={editingProject.name}
                onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                placeholder="Enter project name..."
                className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Project Icon</label>
              <div className="flex items-center gap-3">
                {editingProject.icon && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-800 overflow-hidden">
                    {editingProject.icon.startsWith('data:') ? (
                      <img src={editingProject.icon} alt="Icon" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">{editingProject.icon}</span>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-[#0F1115] px-4 py-3 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Change Icon
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Or use emoji: 🚀 📊 💼 🎨</p>
              <input
                type="text"
                value={editingProject.icon || ''}
                onChange={(e) => setEditingProject({ ...editingProject, icon: e.target.value })}
                placeholder="Or paste emoji or URL..."
                className="mt-2 w-full rounded-lg bg-[#0F1115] px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-700">
              <Button 
                variant="ghost" 
                onClick={handleDeleteProject}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Delete Project
              </Button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => {
                  setIsEditProjectModalOpen(false);
                  setEditingProject(null);
                }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateProject}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Task Title</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter description..."
              rows={3}
              className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-600"
                  style={{ colorScheme: 'dark' }}
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Design">Design</option>
                <option value="Dev">Dev</option>
                <option value="Marketing">Marketing</option>
                <option value="Research">Research</option>
                <option value="Testing">Testing</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TaskStatus)}
              className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
            >
              {statusColumns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTask}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }} 
        title="Edit Task"
      >
        {editingTask && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Task Title</label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                placeholder="Enter task title..."
                className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                placeholder="Enter description..."
                rows={3}
                className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                  className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {statusColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={editingTask.category}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                  className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Design">Design</option>
                  <option value="Dev">Dev</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Research">Research</option>
                  <option value="Testing">Testing</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-600"
                  style={{ colorScheme: 'dark' }}
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <label className="mb-3 block text-sm font-medium text-gray-300">Sub-Tasks</label>
              
              {/* Add Sub-Task Input */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  placeholder="Add new sub-task..."
                  className="flex-1 rounded-lg bg-[#0F1115] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                />
                <Button 
                  variant="primary" 
                  onClick={handleAddSubTask}
                  className="px-3 py-2 text-sm"
                >
                  +
                </Button>
              </div>

              {/* Sub-Task List */}
              {editingTask.subTasks.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg bg-[#0F1115] p-3">
                  {editingTask.subTasks.map((subTask) => (
                    <div 
                      key={subTask.id} 
                      className="flex items-center gap-3 p-2 rounded hover:bg-[#252930] transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={subTask.isCompleted}
                        onChange={() => handleToggleSubTask(subTask.id)}
                        className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-600 cursor-pointer"
                      />
                      <span 
                        className={`flex-1 text-sm ${
                          subTask.isCompleted 
                            ? 'text-gray-500 line-through' 
                            : 'text-gray-300'
                        }`}
                      >
                        {subTask.title}
                      </span>
                      <button
                        onClick={() => handleDeleteSubTask(subTask.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No sub-tasks yet</p>
              )}
            </div>
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-700">
              <Button 
                variant="ghost" 
                onClick={handleDeleteTask}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Delete Task
              </Button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTask(null);
                }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateTask}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;
