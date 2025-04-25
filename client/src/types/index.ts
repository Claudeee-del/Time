export type ActivityCategory = 
  | 'social_media'
  | 'gaming'
  | 'reading'
  | 'lectures'
  | 'practice'
  | 'sleep'
  | 'salah';

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'other';

export interface User {
  id: number;
  username: string;
  displayName: string;
  darkMode: boolean;
}

export interface Activity {
  id: number;
  userId: number;
  category: ActivityCategory;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  createdAt: Date;
}

export interface Expense {
  id: number;
  userId: number;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: Date;
  createdAt: Date;
}

export interface Goal {
  id: number;
  userId: number;
  name: string;
  category: ActivityCategory | ExpenseCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  active: boolean;
  createdAt: Date;
}

export interface Device {
  id: number;
  userId: number;
  name: string;
  deviceId: string;
  lastSynced?: Date;
  active: boolean;
  createdAt: Date;
}

export interface TimeAllocation {
  category: ActivityCategory;
  duration: number; // in hours
  date: Date;
}

export interface ExpenseSummary {
  category: ExpenseCategory;
  amount: number;
}

export interface GoalProgress {
  goalId: number;
  name: string;
  category: ActivityCategory | ExpenseCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  percentage: number;
  isAboveTarget: boolean;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export interface AppSettings {
  autoSync: boolean;
  notificationsEnabled: boolean;
  backupLocation?: string;
}

export interface CategoryIcon {
  category: ActivityCategory | ExpenseCategory;
  className?: string;
}

export interface DashboardSummary {
  id: number;
  label: string;
  value: string;
  change: {
    value: string;
    isPositive: boolean;
    isNegative: boolean;
  };
  icon: React.ReactNode;
  color: string;
}
