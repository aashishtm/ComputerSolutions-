import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, HolidayRequest, Employee } from '../db/db';
import { format } from 'date-fns';
import EmployeeManagement from './EmployeeManagement';
import InventoryManagement from './InventoryManagement';
import Calendar from './Calendar';
import TaskList from './TaskList';

const AdminDashboard: React.FC = () => {
  console.log('AdminDashboard component rendered');

  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'employees' | 'inventory' | 'holidays'>('dashboard');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');

  const holidayRequests = useLiveQuery(() => db.holidayRequests.where('status').equals('pending').toArray());
  const employees = useLiveQuery(() => db.employees.toArray());

  useEffect(() => {
    console.log('AdminDashboard mounted');
    return () => {
      console.log('AdminDashboard unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('Holiday requests:', holidayRequests);
    console.log('Employees:', employees);
  }, [holidayRequests, employees]);

  const handleHolidayAction = async (requestId: number, action: 'approved' | 'rejected') => {
    await db.holidayRequests.update(requestId, { status: action });
  };

  const getEmployeeName = (id: number): string => {
    const employee = employees?.find(e => e.id === id);
    return employee ? employee.name : 'Unknown Employee';
  };

  const renderDashboard = () => (
    <div className="flex flex-col h-full">
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
          <h3 className="text-xl font-semibold mb-4">Upcoming Tasks</h3>
          <TaskList />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4">
        <button
          className={`mr-2 p-2 ${selectedTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`mr-2 p-2 ${selectedTab === 'employees' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('employees')}
        >
          Employees
        </button>
        <button
          className={`mr-2 p-2 ${selectedTab === 'inventory' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={`p-2 ${selectedTab === 'holidays' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('holidays')}
        >
          Holiday Requests
        </button>
      </div>
      {selectedTab === 'dashboard' && renderDashboard()}
      {selectedTab === 'employees' && <EmployeeManagement />}
      {selectedTab === 'inventory' && <InventoryManagement />}
      {selectedTab === 'holidays' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Holiday Requests</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Employee</th>
                <th className="text-left">Start Date</th>
                <th className="text-left">End Date</th>
                <th className="text-left">Reason</th>
                <th className="text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {holidayRequests?.map((request) => (
                <tr key={request.id}>
                  <td>{getEmployeeName(request.employeeId)}</td>
                  <td>{format(new Date(request.startDate), 'MMM d, yyyy')}</td>
                  <td>{format(new Date(request.endDate), 'MMM d, yyyy')}</td>
                  <td>{request.reason}</td>
                  <td>
                    <button
                      className="bg-green-500 text-white p-1 rounded mr-2"
                      onClick={() => request.id && handleHolidayAction(request.id, 'approved')}
    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white p-1 rounded"
                      onClick={() => request.id && handleHolidayAction(request.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;