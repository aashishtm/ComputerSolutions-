import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

interface TodoListProps {
  limit?: number;
}

const TodoList: React.FC<TodoListProps> = ({ limit }) => {
  const todos = useLiveQuery(
    () => db.todos.orderBy('dueDate').limit(limit || Infinity).toArray()
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id} className="mb-2">
            <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
            <span className="ml-2 text-sm text-gray-500">
              {todo.dueDate && new Date(todo.dueDate).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;