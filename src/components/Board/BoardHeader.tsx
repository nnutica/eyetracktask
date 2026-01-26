'use client';

import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Button from '../ui/Button';

interface BoardHeaderProps {
  projectName: string;
  isLoading: boolean;
  onNewTask: () => void;
}

export default function BoardHeader({ projectName, isLoading, onNewTask }: BoardHeaderProps) {
  const router = useRouter();
  const { profile } = useProfile();
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">{isLoading ? 'Loading...' : projectName}</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Archive tasks"
            className="rounded-lg bg-[#1E2128] px-4 py-2 text-sm text-gray-400 outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Button variant="icon">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={onNewTask}>
          <span className="mr-2">+</span>
          New task
        </Button>
        <button
          onClick={() => router.push('/profile')}
          className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-blue-600 transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-600/30"
          title="Edit Profile"
        >
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt={profile.username} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-800 text-2xl font-bold text-gray-400">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
