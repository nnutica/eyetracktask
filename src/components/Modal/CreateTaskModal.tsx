'use client';

import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { TaskStatus } from '@/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  taskDescription: string;
  taskDueDate: string;
  selectedStatus: TaskStatus;
  selectedCategory: string;
  statusColumns: { id: TaskStatus; label: string }[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
  onCategoryChange: (value: string) => void;
  onCreate: () => void;
  isLoading?: boolean;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  taskTitle,
  taskDescription,
  taskDueDate,
  selectedStatus,
  selectedCategory,
  statusColumns,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onStatusChange,
  onCategoryChange,
  onCreate,
  isLoading = false,
}: CreateTaskModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Task Title</label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter task title..."
            className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={taskDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
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
                value={taskDueDate}
                onChange={(e) => onDueDateChange(e.target.value)}
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
              onChange={(e) => onCategoryChange(e.target.value)}
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
            onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
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
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onCreate} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </div>
            ) : (
              'Create Task'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
