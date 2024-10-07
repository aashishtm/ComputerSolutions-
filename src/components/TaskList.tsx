import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

const TaskList: React.FC = () => {
  const tasks = useLiveQuery(
    () => db.todos.orderBy('dueDate').toArray()
  );

  const employees = useLiveQuery(
    () => db.employees.toArray()
  );

  const getEmployeeName = (id: number | null) => {
    if (!id) return 'Unassigned';
    const employee = employees?.find(e => e.id === id);
    return employee ? employee.name : 'Unknown';
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-100 border-green-300';
      case 2: return 'bg-yellow-100 border-yellow-300';
      case 3: return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const toggleTaskCompletion = async (id: number, completed: boolean) => {
    await db.todos.update(id, { completed: !completed });
  };

  const deleteTask = async (id: number) => {
    await db.todos.delete(id);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <ul>
        {tasks?.map((task) => (
          <li key={task.id} className={`mb-2 p-2 border rounded-lg flex items-center ${getPriorityColor(task.priority)}`}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => task.id && toggleTaskCompletion(task.id, task.completed)}
              className="mr-2"
            />
            <div className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>
              <span className="font-semibold">{task.text}</span>
              <div className="text-sm text-gray-600">
                <span className="mr-2">Due: {task.dueDate && format(new Date(task.dueDate), 'MMM d, yyyy HH:mm')}</span>
                <span className="mr-2">Assigned to: {getEmployeeName(task.assignedTo)}</span>
                <span>Priority: {getPriorityLabel(task.priority)}</span>
              </div>
            </div>
            <button
              onClick={() => task.id && deleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;