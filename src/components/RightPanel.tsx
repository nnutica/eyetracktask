'use client';

import React, { useState, useEffect } from 'react';
import { getDueDateStatus, formatDueDate, getCategoryColor } from '@/lib/utils';
import type { Task } from '@/types';

interface RightPanelProps {
  kanbanRef: React.RefObject<{
    getAllTasks: () => Array<{ task: Task; projectName: string; projectId: string }>;
    openTaskModal: (task: Task) => void;
    switchProject: (projectId: string) => void;
  } | null>;
}

export default function RightPanel({ kanbanRef }: RightPanelProps) {
  const [scheduledTasks, setScheduledTasks] = useState<Array<{ task: Task; projectName: string; projectId: string }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateScheduledTasks = () => {
      if (kanbanRef.current) {
        const allTasks = kanbanRef.current.getAllTasks();
        
        // Filter tasks with due dates and sort by date
        const tasksWithDates = allTasks
          .filter(item => item.task.dueDate)
          .sort((a, b) => {
            const dateA = new Date(a.task.dueDate!).getTime();
            const dateB = new Date(b.task.dueDate!).getTime();
            return dateA - dateB;
          });
        
        setScheduledTasks(tasksWithDates);
      }
    };
    
    // Initial load with small delay to ensure kanbanRef is ready
    const initialTimeout = setTimeout(updateScheduledTasks, 100);
    
    // Listen to localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eyetracktask-projects') {
        updateScheduledTasks();
      }
    };
    
    // Listen to custom task update event
    const handleTaskUpdate = () => {
      updateScheduledTasks();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('taskUpdated', handleTaskUpdate);
    
    // Update every minute to refresh "today" status
    const interval = setInterval(updateScheduledTasks, 60000);
    
    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      clearInterval(interval);
    };
  }, [kanbanRef]);

  const handleTaskClick = (item: { task: Task; projectName: string; projectId: string }) => {
    if (kanbanRef.current) {
      kanbanRef.current.switchProject(item.projectId);
      kanbanRef.current.openTaskModal(item.task);
    }
  };

  const getStatusBadge = (status: 'overdue' | 'today' | 'upcoming' | null) => {
    if (!status) return null;
    
    const styles = {
      overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
      today: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      upcoming: 'bg-green-500/10 text-green-400 border-green-500/20',
    };

    const labels = {
      overdue: 'Overdue',
      today: 'Today',
      upcoming: 'Upcoming',
    };

    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="flex h-screen w-80 flex-col bg-[#0F1115] border-l border-gray-800">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Scheduled Tasks</h2>
        <p className="mt-1 text-xs text-gray-500">Sorted by due date</p>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4">
        {!mounted ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        ) : scheduledTasks.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No scheduled tasks</p>
              <p className="mt-1 text-xs text-gray-600">Create tasks with due dates</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledTasks.map((item) => {
              const status = getDueDateStatus(item.task.dueDate);
              const categoryColor = getCategoryColor(item.task.category);
              
              return (
                <div
                  key={`${item.projectId}-${item.task.id}`}
                  onClick={() => handleTaskClick(item)}
                  className="group cursor-pointer rounded-lg border border-gray-800 bg-[#1E2128] p-3 transition-all hover:border-gray-700 hover:bg-[#252830]"
                >
                  {/* Status Badge */}
                  <div className="mb-2 flex items-center justify-between">
                    {getStatusBadge(status)}
                    <span className="text-xs text-gray-500">{formatDueDate(item.task.dueDate!)}</span>
                  </div>

                  {/* Task Title */}
                  <h3 className="mb-1 text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {item.task.title}
                  </h3>

                  {/* Project & Category */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">{item.projectName}</span>
                    <span className="text-gray-700">•</span>
                    <span 
                      className="font-medium"
                      style={{ color: categoryColor }}
                    >
                      {item.task.category}
                    </span>
                  </div>

                  {/* Progress Bar (if has subtasks) */}
                  {item.task.subTasks.length > 0 && (
                    <div className="mt-2">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${(item.task.subTasks.filter(st => st.isCompleted).length / item.task.subTasks.length) * 100}%`
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {item.task.subTasks.filter(st => st.isCompleted).length}/{item.task.subTasks.length} subtasks
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
