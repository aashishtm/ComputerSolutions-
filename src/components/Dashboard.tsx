import React, { useState } from 'react';
import Calendar from './Calendar';
import TaskList from './TaskList';
import AddTaskModal from './AddTaskModal';

const Dashboard: React.FC = () => {
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div>
          <button
            className={`px-4 py-2 rounded ${calendarView === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCalendarView('day')}
          >
            Day
          </button>
          <button
            className={`px-4 py-2 rounded mx-2 ${calendarView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCalendarView('week')}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 rounded ${calendarView === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCalendarView('month')}
          >
            Month
          </button>
        </div>
      </div>
      <div className="flex flex-1 space-x-4 overflow-hidden">
        <div className="w-3/5 overflow-auto">
          <Calendar view={calendarView} onViewChange={setCalendarView} />
        </div>
        <div className="w-2/5 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Upcoming Tasks</h3>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setIsAddTaskModalOpen(true)}
            >
              Add Task
            </button>
          </div>
          <TaskList />
        </div>
      </div>
      {isAddTaskModalOpen && (
        <AddTaskModal onClose={() => setIsAddTaskModalOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;