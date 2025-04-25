import { 
  users, type User, type InsertUser,
  activities, type Activity, type InsertActivity,
  expenses, type Expense, type InsertExpense,
  goals, type Goal, type InsertGoal,
  devices, type Device, type InsertDevice,
  backups, type Backup, type InsertBackup
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(userId: number): Promise<Activity[]>;
  getActivitiesByCategory(userId: number, category: string): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;

  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(userId: number): Promise<Expense[]>;
  getExpensesByCategory(userId: number, category: string): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoals(userId: number): Promise<Goal[]>;
  getGoalsByCategory(userId: number, category: string): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Device operations
  createDevice(device: InsertDevice): Promise<Device>;
  getDevices(userId: number): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;

  // Backup operations
  createBackup(backup: InsertBackup): Promise<Backup>;
  getBackups(userId: number): Promise<Backup[]>;
  getLatestBackup(userId: number): Promise<Backup | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private expenses: Map<number, Expense>;
  private goals: Map<number, Goal>;
  private devices: Map<number, Device>;
  private backups: Map<number, Backup>;
  
  private userId: number;
  private activityId: number;
  private expenseId: number;
  private goalId: number;
  private deviceId: number;
  private backupId: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.expenses = new Map();
    this.goals = new Map();
    this.devices = new Map();
    this.backups = new Map();
    
    this.userId = 1;
    this.activityId = 1;
    this.expenseId = 1;
    this.goalId = 1;
    this.deviceId = 1;
    this.backupId = 1;

    // Create a default user
    this.createUser({
      username: "demo",
      password: "password",
      displayName: "Demo User",
      darkMode: false
    });

    // Add some default goals for the demo user
    this.createGoal({
      userId: 1,
      name: "Sleep 8 hours",
      category: "sleep",
      targetValue: 8,
      currentValue: 7.2,
      unit: "hours",
      active: true,
    });

    this.createGoal({
      userId: 1,
      name: "Social Media < 2 hours",
      category: "social_media",
      targetValue: 2,
      currentValue: 1.75,
      unit: "hours",
      active: true,
    });

    this.createGoal({
      userId: 1,
      name: "Read for 2 hours",
      category: "reading",
      targetValue: 2,
      currentValue: 2.5,
      unit: "hours",
      active: true,
    });

    this.createGoal({
      userId: 1,
      name: "Practice questions (30)",
      category: "practice",
      targetValue: 30,
      currentValue: 35,
      unit: "count",
      active: true,
    });

    this.createGoal({
      userId: 1,
      name: "Gaming < 1 hour",
      category: "gaming",
      targetValue: 1,
      currentValue: 0.75,
      unit: "hours",
      active: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const activity: Activity = { 
      id, 
      ...insertActivity,
      createdAt: now,
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActivitiesByCategory(userId: number, category: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId && activity.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async updateActivity(id: number, activityData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;

    const updatedActivity = { ...activity, ...activityData };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Expense operations
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseId++;
    const now = new Date();
    const expense: Expense = { 
      id, 
      ...insertExpense,
      createdAt: now,
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getExpensesByCategory(userId: number, category: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId && expense.category === category)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async updateExpense(id: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updatedExpense = { ...expense, ...expenseData };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Goal operations
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalId++;
    const now = new Date();
    const goal: Goal = { 
      id, 
      ...insertGoal,
      createdAt: now,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGoalsByCategory(userId: number, category: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId && goal.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async updateGoal(id: number, goalData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const updatedGoal = { ...goal, ...goalData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Device operations
  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.deviceId++;
    const now = new Date();
    const device: Device = { 
      id, 
      ...insertDevice,
      createdAt: now,
    };
    this.devices.set(id, device);
    return device;
  }

  async getDevices(userId: number): Promise<Device[]> {
    return Array.from(this.devices.values())
      .filter(device => device.userId === userId)
      .sort((a, b) => {
        if (a.lastSynced && b.lastSynced) {
          return b.lastSynced.getTime() - a.lastSynced.getTime();
        }
        return a.lastSynced ? -1 : (b.lastSynced ? 1 : 0);
      });
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async updateDevice(id: number, deviceData: Partial<InsertDevice>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;

    const updatedDevice = { ...device, ...deviceData };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<boolean> {
    return this.devices.delete(id);
  }

  // Backup operations
  async createBackup(insertBackup: InsertBackup): Promise<Backup> {
    const id = this.backupId++;
    const now = new Date();
    const backup: Backup = { 
      id, 
      ...insertBackup,
      createdAt: now,
    };
    this.backups.set(id, backup);
    return backup;
  }

  async getBackups(userId: number): Promise<Backup[]> {
    return Array.from(this.backups.values())
      .filter(backup => backup.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLatestBackup(userId: number): Promise<Backup | undefined> {
    const backups = await this.getBackups(userId);
    return backups.length > 0 ? backups[0] : undefined;
  }
}

import { DatabaseStorage } from './database-storage';

// Use the database storage implementation
export const storage = new DatabaseStorage();
