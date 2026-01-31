'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { createClient } from '@/utils/supabase/client';
import Sidebar from '@/components/Sidebar';
import type { Task, Project } from '@/types';
import type { Database } from '@/types/database';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  title: string;
  start: Date;
  end: Date;
  resource: Task & { projectName: string };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const supabase = createClient();

  useEffect(() => {
    fetchTasksWithDueDate();
  }, []);

  const fetchTasksWithDueDate = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Fetch all projects for the user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      const projects = projectsData as ProjectRow[];

      // Fetch all tasks with due dates
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .not('due_date', 'is', null)
        .in(
          'project_id',
          projects?.map((p) => p.id) || []
        );

      if (tasksError) throw tasksError;

      const tasks = tasksData as TaskRow[];

      // Transform tasks into calendar events
      const calendarEvents: CalendarEvent[] = (tasks || []).map((task) => {
        const project = projects?.find((p) => p.id === task.project_id);
        const dueDate = new Date(task.due_date!);

        return {
          title: task.title,
          start: dueDate,
          end: dueDate,
          resource: {
            id: task.id,
            title: task.title,
            description: task.description || undefined,
            status: task.status as any,
            dueDate: task.due_date,
            category: task.category || 'General',
            subTasks: [],
            projectName: project?.name || 'Unknown Project',
          },
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event as CalendarEvent);
  };

  const getEventStyle = (event: Event) => {
    const calEvent = event as CalendarEvent;
    const statusColors = {
      TODO: '#3b82f6', // blue
      IN_PROGRESS: '#f59e0b', // amber
      Review: '#8b5cf6', // purple
      DONE: '#10b981', // green
    };

    return {
      style: {
        backgroundColor: statusColors[calEvent.resource.status] || '#3b82f6',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0F1115]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1115]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Calendar View</h1>
            <p className="text-zinc-400">View all your tasks with due dates</p>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 'calc(100vh - 240px)', minHeight: '600px' }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={getEventStyle}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              toolbar={true}
            />
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-zinc-400 text-sm">Project:</span>
                  <p className="text-white">{selectedEvent.resource.projectName}</p>
                </div>

                <div>
                  <span className="text-zinc-400 text-sm">Status:</span>
                  <p className="text-white">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        selectedEvent.resource.status === 'TODO'
                          ? 'bg-blue-500'
                          : selectedEvent.resource.status === 'IN_PROGRESS'
                          ? 'bg-amber-500'
                          : selectedEvent.resource.status === 'Review'
                          ? 'bg-purple-500'
                          : 'bg-green-500'
                      }`}
                    >
                      {selectedEvent.resource.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 text-sm">Due Date:</span>
                  <p className="text-white">
                    {format(selectedEvent.start, 'PPP')}
                  </p>
                </div>

                {selectedEvent.resource.description && (
                  <div>
                    <span className="text-zinc-400 text-sm">รายละเอียด:</span>
                    <p className="text-white">{selectedEvent.resource.description}</p>
                  </div>
                )}

                <div>
                  <span className="text-zinc-400 text-sm">หมวดหมู่:</span>
                  <p className="text-white">{selectedEvent.resource.category}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        <style jsx global>{`
        /* React Big Calendar Dark Theme Override */
        .calendar-container .rbc-calendar {
          color: white;
          background: transparent;
        }

        .calendar-container .rbc-header {
          color: white;
          background: #18181b;
          border-bottom: 1px solid #3f3f46;
          padding: 12px 4px;
          font-weight: 600;
        }

        .calendar-container .rbc-today {
          background-color: #1e3a8a;
        }

        .calendar-container .rbc-off-range-bg {
          background: #18181b;
        }

        .calendar-container .rbc-date-cell {
          color: white;
          padding: 8px;
        }

        .calendar-container .rbc-off-range {
          color: #52525b;
        }

        .calendar-container .rbc-month-view,
        .calendar-container .rbc-time-view,
        .calendar-container .rbc-agenda-view {
          background: transparent;
          border: 1px solid #3f3f46;
          border-radius: 8px;
        }

        .calendar-container .rbc-month-row {
          border-top: 1px solid #3f3f46;
          min-height: 80px;
        }

        .calendar-container .rbc-day-bg {
          border-left: 1px solid #3f3f46;
        }

        .calendar-container .rbc-event {
          padding: 2px 5px;
          font-size: 0.875rem;
        }

        .calendar-container .rbc-event:focus {
          outline: 2px solid #3b82f6;
        }

        .calendar-container .rbc-toolbar {
          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .calendar-container .rbc-toolbar button {
          color: white;
          background: #27272a;
          border: 1px solid #3f3f46;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .calendar-container .rbc-toolbar button:hover {
          background: #3f3f46;
        }

        .calendar-container .rbc-toolbar button.rbc-active {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .calendar-container .rbc-toolbar-label {
          color: white;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .calendar-container .rbc-time-slot {
          border-top: 1px solid #3f3f46;
          color: #a1a1aa;
        }

        .calendar-container .rbc-time-content {
          border-top: 1px solid #3f3f46;
        }

        .calendar-container .rbc-time-header-content {
          border-left: 1px solid #3f3f46;
        }

        .calendar-container .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #3f3f46;
        }

        .calendar-container .rbc-agenda-view table {
          border: 1px solid #3f3f46;
        }

        .calendar-container .rbc-agenda-view table tbody > tr > td {
          color: white;
          border-top: 1px solid #3f3f46;
          padding: 8px 10px;
        }

        .calendar-container .rbc-agenda-view table thead > tr > th {
          color: white;
          background: #18181b;
          border-bottom: 1px solid #3f3f46;
          padding: 10px;
        }

        .calendar-container .rbc-agenda-date-cell,
        .calendar-container .rbc-agenda-time-cell {
          white-space: nowrap;
        }

        .calendar-container .rbc-agenda-event-cell {
          width: 100%;
        }

        .calendar-container .rbc-show-more {
          background-color: rgba(59, 130, 246, 0.8);
          color: white;
          padding: 2px 5px;
          border-radius: 3px;
          font-weight: 500;
        }
      `}</style>
      </main>
    </div>
  );
}
