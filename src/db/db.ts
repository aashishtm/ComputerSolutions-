import Dexie, { Table } from 'dexie';

export interface Todo {
  id?: number;
  text: string;
  completed: boolean;
  dateCreated: Date;
  dueDate: Date | null;
  assignedTo: number | null;
  priority: number;
}

export interface Employee {
  id?: number;
  name: string;
  position: string;
  payRate: number;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'superAdmin' | 'manager' | 'staff';
}

export interface ClockRecord {
  id?: number;
  employeeId: number;
  clockIn: Date;
  clockOut: Date | null;
}

export interface InventoryItem {
  id?: number;
  name: string;
  quantity: number;
  price: number;
}

export interface HolidayRequest {
  id?: number;
  employeeId: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

class AppDatabase extends Dexie {
  todos!: Table<Todo>;
  employees!: Table<Employee>;
  inventory!: Table<InventoryItem>;
  clockRecords!: Table<ClockRecord>;
  holidayRequests!: Table<HolidayRequest>;

  constructor() {
    super('AppDatabase');
    this.version(91).stores({
      todos: '++id, text, completed, dateCreated, dueDate, assignedTo, priority',
      employees: '++id, name, position, payRate, email, phoneNumber, password, role',
      inventory: '++id, name, quantity, price',
      clockRecords: '++id, employeeId, clockIn, clockOut',
      holidayRequests: '++id, employeeId, startDate, endDate, status'
    });

    this.on('populate', () => this.initializeData());
  }

  async initializeData() {
    const employeeCount = await this.employees.count();
    if (employeeCount === 0) {
      const sampleEmployees = [
        {
          name: 'Admin User',
          position: 'Administrator',
          payRate: 50,
          email: 'admin@example.com',
          phoneNumber: '1234567890',
          password: 'admin123',
          role: 'superAdmin'
        },
        {
          name: 'John Doe',
          position: 'Manager',
          payRate: 40,
          email: 'john@example.com',
          phoneNumber: '9876543210',
          password: 'manager123',
          role: 'manager'
        },
        {
          name: 'Jane Smith',
          position: 'Staff',
          payRate: 25,
          email: 'jane@example.com',
          phoneNumber: '5555555555',
          password: 'staff123',
          role: 'staff'
        }
      ];

      await this.employees.bulkAdd(sampleEmployees);
    }
  }
}

export const db = new AppDatabase();

// Function to reset the database
export async function resetDatabase() {
  await db.delete();
  await db.open();
}