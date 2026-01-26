import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '@/types';

interface StatusColumnProps {
  column: { id: TaskStatus; label: string };
  tasks: Task[];
  mounted: boolean;
  onTaskClick: (task: Task) => void;
}

export default function StatusColumn({ column, tasks, mounted, onTaskClick }: StatusColumnProps) {
  return (
    <div className="flex min-w-75 flex-1 flex-col">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">{column.label}</h2>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E2128] text-xs text-gray-400">
            {mounted ? tasks.length : 0}
          </span>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Droppable Column */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-600/5' : ''
            }`}
          >
            {mounted &&
              tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} onClick={() => onTaskClick(task)} />
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
