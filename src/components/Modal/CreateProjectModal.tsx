'use client';

import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectIcon: string;
  isLoading?: boolean;
  onProjectNameChange: (value: string) => void;
  onProjectIconChange: (value: string) => void;
  onIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  projectName,
  projectIcon,
  isLoading = false,
  onProjectNameChange,
  onProjectIconChange,
  onIconUpload,
  onCreate,
}: CreateProjectModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="Enter project name..."
            className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onCreate()}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Project Icon (Optional)</label>
          <div className="flex items-center gap-3">
            {projectIcon && (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-800 overflow-hidden">
                {projectIcon.length > 2 ? (
                  <img src={projectIcon} alt="Icon" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">{projectIcon}</span>
                )}
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
                  onChange={onIconUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">Or use emoji: 🚀 📊 💼 🎨</p>
          <input
            type="text"
            value={projectIcon}
            onChange={(e) => onProjectIconChange(e.target.value)}
            placeholder="Or paste emoji or URL..."
            className="mt-2 w-full rounded-lg bg-[#0F1115] px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
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
              'Create Project'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
