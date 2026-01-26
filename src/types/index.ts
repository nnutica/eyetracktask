// Type definitions
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'Review' | 'DONE';
  dueDate: string | null;
  category: string;
  subTasks: SubTask[];
}

export interface Project {
  id: string;
  name: string;
  icon?: string; // base64 image or emoji
  tasks: Task[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'Review' | 'DONE';

export interface ScheduledCall {
  id: string;
  title: string;
  time: string;
  date: string;
  attendees?: string[];
}
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture?: string; // base64 image or URL
  createdAt: string;
}