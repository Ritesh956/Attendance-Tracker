import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints for expense tracking
  
  // Get all expenses
  app.get("/api/expenses", async (req: Request, res: Response) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  // Create a new expense
  app.post("/api/expenses", async (req: Request, res: Response) => {
    try {
      const validationResult = insertExpenseSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }

      // Convert amount from rupees to paise if it's a decimal
      const { amount, ...rest } = validationResult.data;
      const amountInPaise = Number.isInteger(amount) 
        ? amount 
        : Math.round(amount * 100);

      const expense = await storage.createExpense({ 
        ...rest, 
        amount: amountInPaise
      });
      
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Delete an expense
  app.delete("/api/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }

      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Move all specific path routes before the parameterized routes
  
  // Get summary statistics - MOST SPECIFIC FIRST
  app.get("/api/expenses/summary", async (req: Request, res: Response) => {
    try {
      const allExpenses = await storage.getExpenses();
      
      // Get today's date and reset time to start of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate end of today
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      // Calculate start of this week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Calculate end of this week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Calculate start of this month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Calculate end of this month
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      // Filter expenses for each time period
      const todayExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= today && expenseDate <= endOfToday;
      });
      
      const weekExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfWeek && expenseDate <= endOfWeek;
      });
      
      const monthExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
      });
      
      // Calculate totals (convert paise to rupees)
      const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const weekTotal = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Category distribution for the week
      const categoryDistribution = categories => {
        const distribution = {};
        categories.forEach(category => {
          const categoryExpenses = weekExpenses.filter(expense => expense.category === category);
          const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          distribution[category] = total;
        });
        return distribution;
      };
      
      // Payment mode distribution for the week
      const paymentDistribution = modes => {
        const distribution = {};
        modes.forEach(mode => {
          const modeExpenses = weekExpenses.filter(expense => expense.paymentMode === mode);
          const total = modeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          distribution[mode] = total;
        });
        return distribution;
      };
      
      // Daily totals for the week
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        
        const dayExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= date && expenseDate < nextDay;
        });
        
        const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        last7Days.push({
          date: date.toISOString().split('T')[0],
          total
        });
      }
      
      // Calculate percentages for insights (mock values for now)
      // In a real app, you'd compare with historical data
      const todayPercentChange = -12; // 12% less than average
      const weekPercentChange = 8;    // 8% more than last week
      const monthPercentChange = 15;  // 15% more than last month
      
      res.json({
        today: {
          total: todayTotal,
          percentChange: todayPercentChange
        },
        week: {
          total: weekTotal,
          percentChange: weekPercentChange,
          categoryDistribution: categoryDistribution(["Food", "Travel", "Fun", "Study", "Other"]),
          paymentDistribution: paymentDistribution(["Cash", "UPI"])
        },
        month: {
          total: monthTotal,
          percentChange: monthPercentChange
        },
        dailyTotals: last7Days
      });
    } catch (error) {
      console.error("Error calculating summary:", error);
      res.status(500).json({ message: "Failed to calculate expense summary" });
    }
  });

  // Get expenses by date range
  app.get("/api/expenses/date-range", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const expenses = await storage.getExpensesByDateRange(start, end);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses by date range:", error);
      res.status(500).json({ message: "Failed to fetch expenses by date range" });
    }
  });

  // Get expenses by category
  app.get("/api/expenses/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const expenses = await storage.getExpensesByCategory(category);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses by category:", error);
      res.status(500).json({ message: "Failed to fetch expenses by category" });
    }
  });

  // Get expenses by payment mode
  app.get("/api/expenses/payment-mode/:paymentMode", async (req: Request, res: Response) => {
    try {
      const { paymentMode } = req.params;
      const expenses = await storage.getExpensesByPaymentMode(paymentMode);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses by payment mode:", error);
      res.status(500).json({ message: "Failed to fetch expenses by payment mode" });
    }
  });

  // Get a single expense by ID - this needs to be last
  app.get("/api/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }

      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
