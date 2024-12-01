export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: ExpenseCategory;
  vehicleId: string;
  attachments?: string[];
}

export type TimeRange = "week" | "month" | "quarter" | "all";

export enum ExpenseCategory {
  Fuel = "Fuel",
  Maintenance = "Maintenance",
  Insurance = "Insurance",
  Toll = "Toll",
  Parking = "Parking",
  Wash = "Wash",
  Accessories = "Accessories", // Thêm mục thiết bị độ xe
  Fine = "Fine", // Thêm mục bị phạt
  Other = "Other",
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
}

export interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  recentTransactions: Transaction[];
  upcomingReminders: Reminder[];
}

export interface Reminder {
  id: string;
  vehicleId: string;
  type: ReminderType;
  dueDate: string;
  description: string;
  isCompleted: boolean;
}

export enum ReminderType {
  Maintenance = "Maintenance",
  Insurance = "Insurance",
  Registration = "Registration",
}
