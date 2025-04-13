export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
  vehicleId: string;
  transactionType: TransactionType;
  attachments?: string[];
}

export type TimeRange = "week" | "month" | "quarter" | "all";

export enum TransactionType {
  Income = "Income",
  Expense = "Expense"
}

export enum TransactionCategory {
  Fuel = "Fuel",
  Maintenance = "Maintenance",
  Insurance = "Insurance",
  Toll = "Toll",
  Parking = "Parking",
  Wash = "Wash",
  Accessories = "Accessories",
  Fine = "Fine",
  LoadingFee = "LoadingFee",
  BrokerageFee = "BrokerageFee",
  Other = "Other",
  ServiceIncome = "ServiceIncome",
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
  totalIncome: number;
  netBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  monthlyNetBalance: number;
  expensesByCategory: Record<TransactionCategory, number>;
  incomeByCategory: Record<TransactionCategory, number>;
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
