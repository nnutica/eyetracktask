'use client';

import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Task, TaskStatus } from '@/types';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  statusColumns: { id: TaskStatus; label: string }[];
  newSubTaskTitle: string;
  onTaskChange: (task: Task) => void;
  onSubTaskTitleChange: (value: string) => void;
  onAddSubTask: () => void;
  onToggleSubTask: (subTaskId: string) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  onUpdate: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  statusColumns,
  newSubTaskTitle,
  onTaskChange,
  onSubTaskTitleChange,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
  onUpdate,
  onDelete,
  isLoading = false,
  isDeleting = false,
}: EditTaskModalProps) {
  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Task Title</label>
          <input
            type="text"
            value={task.title}
            onChange={(e) => onTaskChange({ ...task, title: e.target.value })}
            placeholder="Enter task title..."
            className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={task.description || ''}
            onChange={(e) => onTaskChange({ ...task, description: e.target.value })}
            placeholder="Enter description..."
            rows={3}
            className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
            <select
              value={task.status}
              onChange={(e) => onTaskChange({ ...task, status: e.target.value as TaskStatus })}
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
              value={task.category}
              onChange={(e) => onTaskChange({ ...task, category: e.target.value })}
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
              value={task.dueDate || ''}
              onChange={(e) => onTaskChange({ ...task, dueDate: e.target.value })}
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
              onChange={(e) => onSubTaskTitleChange(e.target.value)}
              placeholder="Add new sub-task..."
              className="flex-1 rounded-lg bg-[#0F1115] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
              onKeyDown={(e) => e.key === 'Enter' && onAddSubTask()}
            />
            <Button 
              variant="primary" 
              onClick={onAddSubTask}
              className="px-3 py-2 text-sm"
            >
              +
            </Button>
          </div>

          {/* Sub-Task List */}
          {task.subTasks.length > 0 ? (
            <div className="max-h-32 overflow-y-auto space-y-2 rounded-lg bg-[#0F1115] p-3 border border-gray-700">
              {task.subTasks.map((subTask) => (
                <div 
                  key={subTask.id} 
                  className="flex items-center gap-3 p-2 rounded hover:bg-[#252930] transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={subTask.isCompleted}
                    onChange={() => onToggleSubTask(subTask.id)}
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
                    onClick={() => onDeleteSubTask(subTask.id)}
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
            onClick={onDelete}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </div>
            ) : (
              'Delete Task'
            )}
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isLoading || isDeleting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onUpdate} disabled={isLoading || isDeleting}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
