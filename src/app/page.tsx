'use client';

import Sidebar from '@/components/Sidebar';
import KanbanBoard from '@/components/Board/KanbanBoard';
import RightPanel from '@/components/RightPanel';
import { useRef } from 'react';

export default function Home() {
  const kanbanRef = useRef<{ 
    openProjectModal: () => void;
    getProjects: () => any[];
    getCurrentProjectId: () => string;
    switchProject: (projectId: string) => void;
    editProject: (project: any) => void;
    getAllTasks: () => Array<{ task: any; projectName: string; projectId: string }>;
    openTaskModal: (task: any) => void;
  } | null>(null);

  const handleNewProject = () => {
    kanbanRef.current?.openProjectModal();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1115]">
      <Sidebar onNewProject={handleNewProject} kanbanRef={kanbanRef} />
      <main className="flex-1 overflow-hidden">
        <KanbanBoard ref={kanbanRef} />
      </main>
      <RightPanel kanbanRef={kanbanRef} />
    </div>
  );
}
