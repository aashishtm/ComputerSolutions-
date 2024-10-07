import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Employee, Todo, ClockRecord, HolidayRequest } from '../db/db';
import { format } from 'date-fns';

interface EmployeeDashboardProps {
  employeeId: number;
  onLogout: () => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ employeeId, onLogout }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [holidayReason, setHolidayReason] = useState('');

  const tasks = useLiveQuery(
    () => db.todos.where('assignedTo').equals(employeeId).toArray(),
    [employeeId]
  );

  const latestClockRecord = useLiveQuery(
    () => db.clockRecords
      .where('employeeId').equals(employeeId)
      .reverse()
      .first(),
    [employeeId]
  );

  const holidayRequests = useLiveQuery(
    () => db.holidayRequests.where('employeeId').equals(employeeId).toArray(),
    [employeeId]
  );

  useEffect(() => {
    const fetchEmployee = async () => {
      const emp = await db.employees.get(employeeId);
      setEmployee(emp || null);
    };
    fetchEmployee();
  }, [employeeId]);

  useEffect(() => {
    if (latestClockRecord && !latestClockRecord.clockOut) {
      setIsClockedIn(true);
    } else {
      setIsClockedIn(false);
    }
  }, [latestClockRecord]);

  const handleClockInOut = async () => {
    if (isClockedIn) {
      await db.clockRecords.update(latestClockRecord!.id!, { clockOut: new Date() });
    } else {
      await db.clockRecords.add({
        employeeId,
        clockIn: new Date(),
        clockOut: null
      });
    }
    setIsClockedIn(!isClockedIn);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employee && employee.id) {
      await db.employees.update(employee.id, employee);
      setIsEditing(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employee && employee.id && newPassword) {
      await db.employees.update(employee.id, { password: newPassword });
      setNewPassword('');
      alert('Password updated successfully');
    }
  };

  const handleHolidayRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (holidayStart && holidayEnd && holidayReason) {
      await db.holidayRequests.add({
        employeeId,
        startDate: new Date(holidayStart),
        endDate: new Date(holidayEnd),
        status: 'pending',
        reason: holidayReason
      });
      setHolidayStart('');
      setHolidayEnd('');
      setHolidayReason('');
      alert('Holiday request submitted');
    }
  };

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <input
              type="text"
              value={employee.name}
              onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
              className="border p-2 mb-2 w-full"
            />
            <input
              type="email"
              value={employee.email}
              onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
              className="border p-2 mb-2 w-full"
            />
            <input
              type="tel"
              value={employee.phoneNumber}
              onChange={(e) => setEmployee({ ...employee, phoneNumber: e.target.value })}
              className="border p-2 mb-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white p-2 rounded ml-2">Cancel</button>
          </form>
        ) : (
          <div>
            <p>Name: {employee.name}</p>
            <p>Email: {employee.email}</p>
            <p>Phone: {employee.phoneNumber}</p>
            <p>Position: {employee.position}</p>
            <p>Pay Rate: £{employee.payRate}/hr</p>
            <p>Role: {employee.role}</p>
            <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white p-2 rounded mt-2">Edit Profile</button>
          </div>
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="border p-2 mb-2 w-full"
          />
          <button type="submit" className="bg-green-500 text-white p-2 rounded">Change Password</button>
        </form>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Clock In/Out</h2>
        <button
          onClick={handleClockInOut}
          className={`p-2 rounded ${isClockedIn ? 'bg-red-500' : 'bg-green-500'} text-white`}
        >
          {isClockedIn ? 'Clock Out' : 'Clock In'}
        </button>
        {latestClockRecord && (
          <p className="mt-2">
            Last clock {latestClockRecord.clockOut ? 'out' : 'in'}: {format(new Date(latestClockRecord.clockOut || latestClockRecord.clockIn), 'MMM d, yyyy HH:mm:ss')}
          </p>
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Holiday Request</h2>
        <form onSubmit={handleHolidayRequest}>
          <input
            type="date"
            value={holidayStart}
            onChange={(e) => setHolidayStart(e.target.value)}
            className="border p-2 mb-2 mr-2"
          />
          <input
            type="date"
            value={holidayEnd}
            onChange={(e) => setHolidayEnd(e.target.value)}
            className="border p-2 mb-2 mr-2"
          />
          <input
            type="text"
            value={holidayReason}
            onChange={(e) => setHolidayReason(e.target.value)}
            placeholder="Reason for holiday"
            className="border p-2 mb-2 w-full"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit Holiday Request</button>
        </form>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Holiday Requests</h2>
        <ul>
          {holidayRequests?.map((request) => (
            <li key={request.id} className="mb-2">
              {format(new Date(request.startDate), 'MMM d, yyyy')} - {format(new Date(request.endDate), 'MMM d, yyyy')}: {request.status}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Assigned Tasks</h2>
        <ul>
          {tasks?.map((task) => (
            <li key={task.id} className="mb-2">
              <span className={task.completed ? 'line-through' : ''}>{task.text}</span>
              <span className="ml-2 text-sm text-gray-500">
                Due: {task.dueDate && format(new Date(task.dueDate), 'MMM d, yyyy HH:mm')}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={onLogout} className="bg-red-500 text-white p-2 rounded">Logout</button>
    </div>
  );
};

export default EmployeeDashboard;