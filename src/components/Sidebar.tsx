'use client';

import React, { useState, useEffect } from 'react';
import type { Project } from '@/types';

interface SidebarProps {
  onNewProject?: () => void;
  kanbanRef?: React.RefObject<{
    getProjects: () => Project[];
    getCurrentProjectId: () => string;
    switchProject: (projectId: string) => void;
    editProject: (project: Project) => void;
  } | null>;
}

export default function Sidebar({ onNewProject, kanbanRef }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');

  useEffect(() => {
    if (kanbanRef?.current) {
      setProjects(kanbanRef.current.getProjects());
      setCurrentProjectId(kanbanRef.current.getCurrentProjectId());
    }
  }, [kanbanRef]);

  // Update projects list when sidebar expands or every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (kanbanRef?.current) {
        setProjects(kanbanRef.current.getProjects());
        setCurrentProjectId(kanbanRef.current.getCurrentProjectId());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [kanbanRef]);

  const handleProjectClick = (projectId: string) => {
    if (kanbanRef?.current) {
      kanbanRef.current.switchProject(projectId);
      setCurrentProjectId(projectId);
    }
  };

  const getProjectInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  const navItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      active: true,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      active: false,
    },
    
  ];

  return (
    <div 
      className={`flex h-screen flex-col bg-[#0F1115] py-6 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="px-3">
        {/* Logo */}
        <div className="mb-8 flex h-10 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-600">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          {isExpanded && (
            <span className="font-semibold text-white whitespace-nowrap">EyeTrackTask</span>
          )}
        </div>
        </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 px-3">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex h-12 items-center gap-3 rounded-lg transition-all duration-200 ${
              item.active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
            } ${isExpanded ? 'px-3 justify-start' : 'justify-center'}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              {item.icon}
            </div>
            {isExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>
            )}
          </button>
        ))}
      </nav>

      {/* Projects Section */}
      <div className="mt-6 flex-1 overflow-y-auto">
        <div className={`mb-3 px-3 ${!isExpanded ? 'mb-2' : ''}`}>
          {isExpanded ? (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Projects</h3>
          ) : (
            <div className="h-px bg-gray-800"></div>
          )}
        </div>
        <div className="space-y-2 px-5">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (kanbanRef?.current) {
                  kanbanRef.current.editProject(project);
                }
              }}
              className={`flex h-12 items-center gap-3 rounded-lg transition-all duration-200 ${
                project.id === currentProjectId
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              } ${isExpanded ? 'px-3 justify-start w-full' : 'justify-center'}`}
              title={isExpanded ? '' : `${project.name} (Right-click to edit)`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold overflow-hidden ${
                project.id === currentProjectId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {project.icon ? (
                  project.icon.startsWith('data:') || project.icon.startsWith('http') ? (
                    <img src={project.icon} alt={project.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg">{project.icon}</span>
                  )
                ) : (
                  getProjectInitials(project.name)
                )}
              </div>
              {isExpanded && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm font-medium truncate">{project.name}</span>
                  <svg className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* New Project Button */}
      <div className="mt-auto px-3">
        <button 
          onClick={onNewProject}
          className={`flex h-12 items-center gap-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 ${
            isExpanded ? 'px-3 justify-start w-full' : 'justify-center'
          }`}
          title="New Project"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap">New Project</span>
          )}
        </button>

        {/* Theme Toggle */}
        <button className={`mt-4 flex h-10 items-center gap-3 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-all duration-200 ${
          isExpanded ? 'px-3 justify-start w-full' : 'justify-center'
        }`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap">Dark Mode</span>
          )}
        </button>
      </div>
    </div>
  );
}
