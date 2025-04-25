import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema, insertExpenseSchema, insertGoalSchema, insertUserSchema, insertDeviceSchema } from "@shared/schema";
import { z, ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Activity routes
  app.post("/api/activities", async (req, res) => {
    try {
      // Convert date strings to Date objects if they're strings
      let data = req.body;
      if (data.startTime && typeof data.startTime === 'string') {
        data = {
          ...data,
          startTime: new Date(data.startTime)
        };
      }
      
      if (data.endTime && typeof data.endTime === 'string') {
        data = {
          ...data,
          endTime: new Date(data.endTime)
        };
      }
      
      const activityData = insertActivitySchema.parse(data);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        console.error("Error creating activity:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/activities", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      const category = req.query.category as string | undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      let activities;
      if (category) {
        activities = await storage.getActivitiesByCategory(userId, category);
      } else {
        activities = await storage.getActivities(userId);
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activityData = insertActivitySchema.partial().parse(req.body);
      const activity = await storage.updateActivity(id, activityData);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteActivity(id);
      if (!success) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete all activities for a user
  app.delete("/api/activities/all", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const activities = await storage.getActivities(userId);
      let deletedCount = 0;
      
      for (const activity of activities) {
        const success = await storage.deleteActivity(activity.id);
        if (success) deletedCount++;
      }
      
      res.json({ message: `${deletedCount} activities deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Expense routes
  app.post("/api/expenses", async (req, res) => {
    try {
      // Convert date string to Date object if it's a string
      let data = req.body;
      if (data.date && typeof data.date === 'string') {
        data = {
          ...data,
          date: new Date(data.date)
        };
      }
      
      const expenseData = insertExpenseSchema.parse(data);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/expenses", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      const category = req.query.category as string | undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      let expenses;
      if (category) {
        expenses = await storage.getExpensesByCategory(userId, category);
      } else {
        expenses = await storage.getExpenses(userId);
      }
      
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, expenseData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete all expenses for a user
  app.delete("/api/expenses/all", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const expenses = await storage.getExpenses(userId);
      let deletedCount = 0;
      
      for (const expense of expenses) {
        const success = await storage.deleteExpense(expense.id);
        if (success) deletedCount++;
      }
      
      res.json({ message: `${deletedCount} expenses deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Goal routes
  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/goals", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      const category = req.query.category as string | undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      let goals;
      if (category) {
        goals = await storage.getGoalsByCategory(userId, category);
      } else {
        goals = await storage.getGoals(userId);
      }
      
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getGoal(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goalData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(id, goalData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGoal(id);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete all goals for a user
  app.delete("/api/goals/all", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const goals = await storage.getGoals(userId);
      let deletedCount = 0;
      
      for (const goal of goals) {
        const success = await storage.deleteGoal(goal.id);
        if (success) deletedCount++;
      }
      
      res.json({ message: `${deletedCount} goals deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Device routes
  app.post("/api/devices", async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/devices", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const devices = await storage.getDevices(userId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deviceData = insertDeviceSchema.partial().parse(req.body);
      const device = await storage.updateDevice(id, deviceData);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Data export/import routes
  app.get("/api/export", async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId));
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const activities = await storage.getActivities(userId);
      const expenses = await storage.getExpenses(userId);
      const goals = await storage.getGoals(userId);
      const devices = await storage.getDevices(userId);
      
      const exportData = {
        activities,
        expenses,
        goals,
        devices,
        exportDate: new Date(),
      };
      
      // Create backup record
      await storage.createBackup({
        userId,
        data: exportData,
      });
      
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/import", async (req, res) => {
    try {
      const importSchema = z.object({
        userId: z.number(),
        data: z.object({
          activities: z.array(z.any()),
          expenses: z.array(z.any()),
          goals: z.array(z.any()),
          devices: z.array(z.any()),
          exportDate: z.string().or(z.date()),
        }),
      });
      
      const { userId, data } = importSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a backup before importing
      const currentData = {
        activities: await storage.getActivities(userId),
        expenses: await storage.getExpenses(userId),
        goals: await storage.getGoals(userId),
        devices: await storage.getDevices(userId),
        exportDate: new Date(),
      };
      
      await storage.createBackup({
        userId,
        data: currentData,
      });
      
      // Import data (in a real app, we would need to be more careful about duplicates)
      const importResults = {
        activities: 0,
        expenses: 0, 
        goals: 0,
        devices: 0,
      };
      
      for (const activity of data.activities) {
        await storage.createActivity({
          userId,
          category: activity.category,
          description: activity.description,
          startTime: new Date(activity.startTime),
          endTime: activity.endTime ? new Date(activity.endTime) : undefined,
          duration: activity.duration,
        });
        importResults.activities++;
      }
      
      for (const expense of data.expenses) {
        await storage.createExpense({
          userId,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: new Date(expense.date),
        });
        importResults.expenses++;
      }
      
      for (const goal of data.goals) {
        await storage.createGoal({
          userId,
          name: goal.name,
          category: goal.category,
          targetValue: goal.targetValue,
          currentValue: goal.currentValue,
          unit: goal.unit,
          active: goal.active,
        });
        importResults.goals++;
      }
      
      for (const device of data.devices) {
        await storage.createDevice({
          userId,
          name: device.name,
          deviceId: device.deviceId,
          lastSynced: device.lastSynced ? new Date(device.lastSynced) : undefined,
          active: device.active,
        });
        importResults.devices++;
      }
      
      res.json({
        message: "Data imported successfully",
        importResults,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
