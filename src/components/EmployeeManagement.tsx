import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Employee } from '../db/db';

const EmployeeManagement: React.FC = () => {
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({ name: '', position: '', payRate: 0, email: '', phoneNumber: '', role: 'staff' });
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const employees = useLiveQuery(
    () => db.employees.where('role').notEqual('superAdmin').toArray()
  );

  const addEmployee = async () => {
    if (newEmployee.name && newEmployee.position && newEmployee.payRate && newEmployee.email && newEmployee.phoneNumber && newEmployee.role) {
      await db.employees.add({
        ...newEmployee,
        password: 'defaultpassword' // You should implement a proper password system
      } as Employee);
      setNewEmployee({ name: '', position: '', payRate: 0, email: '', phoneNumber: '', role: 'staff' });
    }
  };

  const updateEmployee = async () => {
    if (editingEmployee && editingEmployee.id) {
      await db.employees.update(editingEmployee.id, editingEmployee);
      setEditingEmployee(null);
    }
  };

  const deleteEmployee = async (id: number) => {
    await db.employees.delete(id);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Employee Management</h2>
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-grow border rounded-l px-4 py-2 mr-2"
          placeholder="Employee Name"
          value={newEmployee.name}
          onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
        />
        <input
          type="text"
          className="flex-grow border px-4 py-2 mr-2"
          placeholder="Position"
          value={newEmployee.position}
          onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
        />
        <input
          type="number"
          className="w-24 border px-4 py-2 mr-2"
          placeholder="Pay Rate"
          value={newEmployee.payRate}
          onChange={(e) => setNewEmployee({ ...newEmployee, payRate: parseFloat(e.target.value) || 0 })}
        />
        <input
          type="email"
          className="flex-grow border px-4 py-2 mr-2"
          placeholder="Email"
          value={newEmployee.email}
          onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
        />
        <input
          type="tel"
          className="flex-grow border px-4 py-2 mr-2"
          placeholder="Phone Number"
          value={newEmployee.phoneNumber}
          onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
        />
        <select
          className="border px-4 py-2 mr-2"
          value={newEmployee.role}
          onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as 'manager' | 'staff' })}
        >
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={addEmployee}
        >
          <Plus size={20} />
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Position</th>
            <th className="p-2 text-left">Pay Rate</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Phone Number</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees?.map(employee => (
            <tr key={employee.id} className="border-b">
              <td className="p-2">{employee.name}</td>
              <td className="p-2">{employee.position}</td>
              <td className="p-2">£{employee.payRate.toFixed(2)}/hr</td>
              <td className="p-2">{employee.email}</td>
              <td className="p-2">{employee.phoneNumber}</td>
              <td className="p-2">{employee.role}</td>
              <td className="p-2">
                <button
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  onClick={() => setEditingEmployee(employee)}
                >
                  <Edit2 size={20} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => employee.id && deleteEmployee(employee.id)}
                >
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Employee</h3>
            <input
              type="text"
              className="border rounded px-4 py-2 mb-2 w-full"
              value={editingEmployee.name}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
            />
            <input
              type="text"
              className="border rounded px-4 py-2 mb-2 w-full"
              value={editingEmployee.position}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
            />
            <input
              type="number"
              className="border rounded px-4 py-2 mb-2 w-full"
              value={editingEmployee.payRate}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, payRate: parseFloat(e.target.value) || 0 })}
            />
            <input
              type="email"
              className="border rounded px-4 py-2 mb-2 w-full"
              value={editingEmployee.email}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
            />
            <input
              type="tel"
              className="border rounded px-4 py-2 mb-2 w-full"
              value={editingEmployee.phoneNumber}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, phoneNumber: e.target.value })}
            />
            <select
              className="border rounded px-4 py-2 mb-4 w-full"
              value={editingEmployee.role}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as 'manager' | 'staff' })}
            >
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                onClick={updateEmployee}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setEditingEmployee(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;