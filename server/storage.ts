import { expenses, type Expense, type InsertExpense } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getExpenses(): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  getExpensesByPaymentMode(paymentMode: string): Promise<Expense[]>;
}

export class MemStorage implements IStorage {
  private expenses: Map<number, Expense>;
  currentId: number;
  private dataPath: string;

  constructor() {
    this.expenses = new Map();
    this.currentId = 1;
    this.dataPath = path.join(process.cwd(), "data.json");
    this.loadData();
  }

  private async loadData() {
    try {
      const data = await fs.readFile(this.dataPath, "utf-8");
      const parsedData = JSON.parse(data);
      
      if (Array.isArray(parsedData)) {
        parsedData.forEach((expense: Expense) => {
          this.expenses.set(expense.id, {
            ...expense,
            date: new Date(expense.date)
          });
          // Update currentId to be one more than the highest id
          if (expense.id >= this.currentId) {
            this.currentId = expense.id + 1;
          }
        });
      }
    } catch (error) {
      // File doesn't exist yet or invalid JSON, initialize with empty data
      await this.saveData();
    }
  }

  private async saveData() {
    const data = Array.from(this.expenses.values());
    await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentId++;
    
    // If date is not provided, use current date
    const date = insertExpense.date || new Date();
    
    const expense: Expense = { id, ...insertExpense, date };
    this.expenses.set(id, expense);
    await this.saveData();
    return expense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const deleted = this.expenses.delete(id);
    if (deleted) {
      await this.saveData();
    }
    return deleted;
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpensesByPaymentMode(paymentMode: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.paymentMode === paymentMode)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const storage = new MemStorage();
