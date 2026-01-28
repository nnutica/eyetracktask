'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project, Task, SubTask } from '@/types'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type TaskRow = Database['public']['Tables']['tasks']['Row']
type SubTaskRow = Database['public']['Tables']['sub_tasks']['Row']

export function useSupabaseProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch all projects for current user
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setProjects([])
        setError('User not authenticated')
        return
      }

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id) as any

      if (projectsError) {
        console.error('Projects error:', projectsError)
        throw projectsError
      }

      // Fetch tasks for each project
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in(
          'project_id',
          (projectsData as any)?.map((p: ProjectRow) => p.id) || []
        ) as any

      if (tasksError) {
        console.error('Tasks error:', tasksError)
        throw tasksError
      }

      // Fetch subtasks for all tasks
      const { data: subTasksData, error: subTasksError } = await supabase
        .from('sub_tasks')
        .select('*')
        .in(
          'task_id',
          (tasksData as any)?.map((t: TaskRow) => t.id) || []
        ) as any

      if (subTasksError) {
        console.error('SubTasks error:', subTasksError)
        throw subTasksError
      }

      // Map data to client types
      const projectsWithTasks: Project[] = ((projectsData as any) || []).map((proj: ProjectRow) => ({
        id: proj.id,
        name: proj.name,
        icon: proj.icon || undefined,
        tasks: ((tasksData as any) || [])
          .filter((t: TaskRow) => t.project_id === proj.id)
          .map((task: TaskRow) => ({
            id: task.id,
            title: task.title,
            description: task.description || undefined,
            status: task.status as any,
            dueDate: task.due_date,
            category: task.category,
            subTasks: ((subTasksData as any) || [])
              .filter((st: SubTaskRow) => st.task_id === task.id)
              .map((st: SubTaskRow) => ({
                id: st.id,
                title: st.title,
                isCompleted: st.is_completed,
              })),
          })),
      }))

      setProjects(projectsWithTasks)
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(
    async (name: string, icon?: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              user_id: user.id,
              name,
              icon: icon || null,
            },
          ] as any)
          .select()

        if (error) throw error

        await fetchProjects()
        return data?.[0]
      } catch (err) {
        console.error('Error creating project:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const updateProject = useCallback(
    async (projectId: string, updates: Partial<ProjectRow>) => {
      try {
        const { error } = await (supabase
          .from('projects') as any)
          .update(updates)
          .eq('id', projectId)

        if (error) throw error

        await fetchProjects()
      } catch (err) {
        console.error('Error updating project:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)

        if (error) throw error

        await fetchProjects()
      } catch (err) {
        console.error('Error deleting project:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const addTask = useCallback(
    async (
      projectId: string,
      title: string,
      description?: string,
      dueDate?: string,
      category?: string
    ) => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([
            {
              project_id: projectId,
              title,
              description: description || null,
              status: 'TODO',
              due_date: dueDate || null,
              category: category || 'Dev',
            },
          ] as any)
          .select()

        if (error) throw error

        await fetchProjects()
        return data?.[0]
      } catch (err) {
        console.error('Error adding task:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<TaskRow>) => {
      try {
        const { error } = await (supabase
          .from('tasks') as any)
          .update(updates)
          .eq('id', taskId)

        if (error) throw error

        await fetchProjects()
      } catch (err) {
        console.error('Error updating task:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        // Delete subtasks first
        await supabase.from('subtasks').delete().eq('task_id', taskId)

        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)

        if (error) throw error

        await fetchProjects()
      } catch (err) {
        console.error('Error deleting task:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const addSubTask = useCallback(
    async (taskId: string, title: string) => {
      try {
        const { data, error } = await supabase
          .from('sub_tasks')
          .insert([
            {
              task_id: taskId,
              title,
              is_completed: false,
            },
          ] as any)
          .select()

        if (error) throw error

        await fetchProjects()
        return data?.[0]
      } catch (err) {
        console.error('Error adding subtask:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const updateSubTask = useCallback(
    async (subTaskId: string, updates: Partial<SubTaskRow>) => {
      try {
        const { error } = await (supabase
          .from('sub_tasks') as any)
          .update(updates)
          .eq('id', subTaskId)

        if (error) throw error

        await fetchProjects()
      } catch (err) {
        console.error('Error updating subtask:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  const deleteSubTask = useCallback(
    async (subTaskId: string) => {
      try {
        const { error } = await supabase
          .from('sub_tasks')
          .delete()
          .eq('id', subTaskId)

        if (error) throw error

        await fetchProjects()
      } catch (err) {
        console.error('Error deleting subtask:', err)
        throw err
      }
    },
    [supabase, fetchProjects]
  )

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addSubTask,
    updateSubTask,
    deleteSubTask,
    refetch: fetchProjects,
  }
}
