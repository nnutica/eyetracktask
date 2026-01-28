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
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const updateScheduledTasks = () => {
      if (kanbanRef.current) {
        const allTasks = kanbanRef.current.getAllTasks();
        
        // Filter tasks with due dates and sort by date
        const tasksWithDates = allTasks
          .filter(item => item.task.dueDate && item.task.status !== 'DONE')
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
    
    // Listen to custom event
    const handleProjectsUpdated = () => {
      updateScheduledTasks();
    };
    
    window.addEventListener('projectsUpdated', handleProjectsUpdated);
    
    // Update every minute to refresh "today" status
    const interval = setInterval(updateScheduledTasks, 60000);
    
    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('projectsUpdated', handleProjectsUpdated);
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
    <div
      className={`group/right flex h-screen flex-col border-l border-gray-800 bg-[#0F1115] transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-800 p-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse scheduled tasks panel' : 'Expand scheduled tasks panel'}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 transition-colors hover:bg-blue-600/20"
        >
          <svg
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-180'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        {isExpanded && (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Scheduled Tasks</h2>
                <p className="mt-1 text-xs text-gray-500">Sorted by due date</p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-md p-2 text-gray-500 transition-colors hover:text-white"
                aria-label="Collapse panel"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className={`flex-1 overflow-y-auto ${isExpanded ? 'p-4' : 'p-2'}`}>
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
              {isExpanded && (
                <>
                  <p className="text-sm text-gray-500">No scheduled tasks</p>
                  <p className="mt-1 text-xs text-gray-600">Create tasks with due dates</p>
                </>
              )}
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
                  className={`group cursor-pointer rounded-lg border border-gray-800 bg-[#1E2128] transition-all hover:border-gray-700 hover:bg-[#252830] ${
                    isExpanded ? 'p-3' : 'p-2'
                  }`}
                >
                  {/* Status Badge */}
                  <div className={`mb-2 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                    {getStatusBadge(status)}
                    {isExpanded && (
                      <span className="text-xs text-gray-500">{formatDueDate(item.task.dueDate!)}</span>
                    )}
                  </div>

                  {/* Task Title */}
                  {isExpanded ? (
                    <h3 className="mb-1 text-sm font-medium text-white transition-colors group-hover:text-blue-400">
                      {item.task.title}
                    </h3>
                  ) : (
                    <div className="text-center text-xs font-medium text-white/80">{item.task.title}</div>
                  )}

                  {/* Project & Category */}
                  {isExpanded ? (
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
                  ) : (
                    <div className="text-center text-[10px] text-gray-500">{item.projectName}</div>
                  )}

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
                      {isExpanded && (
                        <p className="mt-1 text-xs text-gray-600">
                          {item.task.subTasks.filter(st => st.isCompleted).length}/{item.task.subTasks.length} subtasks
                        </p>
                      )}
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
