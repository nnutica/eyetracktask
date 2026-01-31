import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProgressPercentage(subTasks?: { isCompleted: boolean }[] | null): number {
  if (!subTasks || subTasks.length === 0) return 0;
  const completed = subTasks.filter(st => st.isCompleted).length;
  return Math.round((completed / subTasks.length) * 100);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Design: '#F59E0B',
    Dev: '#3B82F6',
    Development: '#3B82F6',
    Marketing: '#8B5CF6',
    Research: '#EF4444',
    Testing: '#10B981',
    Other: '#9CA3AF',
    default: '#6B7280',
  };
  return colors[category] || colors.default;
}

export function getDueDateStatus(dueDate: string | null): 'overdue' | 'today' | 'upcoming' | null {
  if (!dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  return 'upcoming';
}

export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
