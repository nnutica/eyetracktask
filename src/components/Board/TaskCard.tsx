'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '@/types';
import { getProgressPercentage, getCategoryColor } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick?: () => void;
}

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const progress = getProgressPercentage(task.subTasks);
  const categoryColor = getCategoryColor(task.category);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group mb-3 rounded-xl bg-[#1E2128] p-4 transition-all duration-200 hover:bg-[#252930] cursor-pointer ${
            snapshot.isDragging ? 'shadow-2xl shadow-blue-600/20 rotate-2 scale-105' : ''
          }`}
        >
          {/* Category */}
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: categoryColor }}
            ></div>
            <span className="text-xs font-medium text-gray-400">{task.category}</span>
          </div>

          {/* Title */}
          <h3 className="mb-3 text-sm font-semibold text-white line-clamp-2">
            {task.title}
          </h3>

          {/* Due Date */}
          {task.dueDate && (
            <div className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}

          {/* Progress Bar */}
          {task.subTasks.length > 0 && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-[#0F1115]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: categoryColor,
                  }}
                ></div>
              </div>
            </div>
          )}


        </div>
      )}
    </Draggable>
  );
}
