// Supabase Database Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'TODO' | 'IN_PROGRESS' | 'Review' | 'DONE'
          due_date: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'TODO' | 'IN_PROGRESS' | 'Review' | 'DONE'
          due_date?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'TODO' | 'IN_PROGRESS' | 'Review' | 'DONE'
          due_date?: string | null
          category?: string | null
          created_at?: string
        }
      }
      sub_tasks: {
        Row: {
          id: string
          task_id: string
          title: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          is_completed?: boolean
          created_at?: string
        }
      }
      scheduled_calls: {
        Row: {
          id: string
          user_id: string
          title: string
          start_time: string
          attendees: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          start_time: string
          attendees?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          start_time?: string
          attendees?: string[] | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Legacy types for backward compatibility
export interface ProjectDB {
  id: string
  user_id: string
  name: string
  icon?: string
  created_at: string
}

export interface TaskDB {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'Review' | 'DONE'
  due_date: string | null
  category: string
  created_at: string
}

export interface SubTaskDB {
  id: string
  task_id: string
  title: string
  is_completed: boolean
}