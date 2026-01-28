'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';

interface BoardHeaderProps {
  projectName: string;
  isLoading: boolean;
  onNewTask: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (status: string) => void;
}

export default function BoardHeader({ projectName, isLoading, onNewTask, onSearch, onFilter }: BoardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const statusOptions = ['All', 'TODO', 'IN_PROGRESS', 'Review', 'DONE'];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterSelect = (status: string) => {
    const newFilter = activeFilter === status ? null : status;
    setActiveFilter(newFilter);
    onFilter?.(newFilter === 'All' || !newFilter ? '' : newFilter);
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-2xl font-bold text-white">{projectName}</h1>
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 rounded-lg bg-[#1E2128] px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-600"
          />
          <div className="relative">
            <Button 
              variant="icon"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              title="Filter by status"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </Button>

            {/* Filter Dropdown Menu */}
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50 min-w-max">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      handleFilterSelect(status);
                      setShowFilterMenu(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      activeFilter === status
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    } ${status === statusOptions[0] ? 'border-b border-zinc-800' : ''}`}
                  >
                    <div className={`h-2 w-2 rounded-full ${
                      activeFilter === status ? 'bg-blue-400' : 'bg-gray-600'
                    }`}></div>
                    {status === 'All' ? 'All Tasks' : status}
                  </button>
                ))}
              </div>
            )}
          </div>
          {activeFilter && activeFilter !== 'All' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
              <span className="text-sm text-blue-400">Filtering:</span>
              <span className="text-sm font-semibold text-blue-300">{activeFilter}</span>
              <button
                onClick={() => {
                  setActiveFilter(null);
                  onFilter?.('');
                }}
                className="ml-1 text-blue-400 hover:text-blue-300 transition-colors"
                title="Clear filter"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={onNewTask}>
          <span className="mr-2">+</span>
          New task
        </Button>
      </div>
    </div>
  );
}
