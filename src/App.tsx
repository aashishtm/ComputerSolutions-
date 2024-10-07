import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Employee, db, resetDatabase } from './db/db';

function App() {
  const [loggedInEmployee, setLoggedInEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDb = async () => {
      try {
        await db.open();
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initDb();
  }, []);

  const handleLogin = (employee: Employee) => {
    setLoggedInEmployee(employee);
  };

  const handleLogout = () => {
    setLoggedInEmployee(null);
  };

  const handleReset = async () => {
    setIsLoading(true);
    await resetDatabase();
    setIsLoading(false);
    setLoggedInEmployee(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!loggedInEmployee && <Login onLogin={handleLogin} />}
      {loggedInEmployee && loggedInEmployee.role === 'superAdmin' && <AdminDashboard />}
      {loggedInEmployee && (loggedInEmployee.role === 'staff' || loggedInEmployee.role === 'manager') && (
        <EmployeeDashboard employeeId={loggedInEmployee.id!} onLogout={handleLogout} />
      )}
      <button
        onClick={handleReset}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Reset Database (Dev Only)
      </button>
    </div>
  );
}

export default App;