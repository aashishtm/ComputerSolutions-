import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Todo } from '../db/db';

type CalendarView = 'day' | 'week' | 'month';

interface CalendarProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const Calendar: React.FC<CalendarProps> = ({ view, onViewChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const todos = useLiveQuery(() => {
    let startDate, endDate;
    if (view === 'day') {
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
    } else if (view === 'week') {
      startDate = startOfWeek(currentDate);
      endDate = endOfWeek(currentDate);
    } else {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    }
    return db.todos.where('dueDate').between(startDate, endDate).toArray();
  }, [currentDate, view]);

  const onDateClick = (day: Date) => {
    setCurrentDate(day);
    onViewChange('day');
  };

  const nextPeriod = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const prevPeriod = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, -1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const renderHeader = () => {
    const dateFormat = view === 'month' ? "MMMM yyyy" : "MMMM d, yyyy";
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevPeriod} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-xl font-semibold">
          {format(currentDate, dateFormat)}
        </h3>
        <button onClick={nextPeriod} className="p-1">
          <ChevronRight size={24} />
        </button>
      </div>
    );
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-100 border-green-300';
      case 2: return 'bg-yellow-100 border-yellow-300';
      case 3: return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const renderDayView = () => {
    const todosForDay = todos?.filter(todo => isSameDay(new Date(todo.dueDate), currentDate)) || [];
    return (
      <div className="h-full overflow-y-auto">
        <h4 className="font-bold mb-2">{format(currentDate, 'EEEE')}</h4>
        {todosForDay.map(todo => (
          <div key={todo.id} className={`mb-2 p-2 rounded-lg ${getPriorityColor(todo.priority)}`}>
            <span className="font-semibold">{format(new Date(todo.dueDate), 'HH:mm')}</span> - {todo.text}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const todosForDay = todos?.filter(todo => isSameDay(new Date(todo.dueDate), day)) || [];
          return (
            <div key={day.toString()} className="border p-2 cursor-pointer" onClick={() => onDateClick(day)}>
              <h4 className="font-bold mb-2">{format(day, 'EEE d')}</h4>
              {todosForDay.map(todo => (
                <div key={todo.id} className={`text-sm mb-1 truncate p-1 rounded ${getPriorityColor(todo.priority)}`}>
                  {todo.text}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const todosForDay = todos?.filter(todo => 
          isSameDay(new Date(todo.dueDate), cloneDay)
        ) || [];
        days.push(
          <div
            key={day.toString()}
            className={`p-2 border ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400"
                : isSameDay(day, new Date())
                ? "bg-blue-500 text-white"
                : ""
            } hover:bg-gray-100 cursor-pointer`}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className="font-bold">{formattedDate}</span>
            {todosForDay.map(todo => (
              <div key={todo.id} className={`text-xs mt-1 truncate p-1 rounded ${getPriorityColor(todo.priority)}`}>
                {todo.text}
              </div>
            ))}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-full">
      {renderHeader()}
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
    </div>
  );
};

export default Calendar;