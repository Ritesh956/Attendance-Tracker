import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define valid categories and payment modes
export const categories = ["Food", "Travel", "Fun", "Study", "Other"] as const;
export const paymentModes = ["Cash", "UPI"] as const;

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(), // Store amount in paise to avoid floating-point issues
  description: text("description").notNull(),
  category: text("category", { enum: categories }).notNull(),
  paymentMode: text("payment_mode", { enum: paymentModes }).notNull(),
  notes: text("notes"),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true })
  .extend({
    amount: z.number().positive("Amount must be greater than 0"),
    category: z.enum(categories, {
      errorMap: () => ({ message: "Please select a valid category" }),
    }),
    paymentMode: z.enum(paymentModes, {
      errorMap: () => ({ message: "Please select a valid payment mode" }),
    }),
  });

export type ExpenseCategory = typeof categories[number];
export type PaymentMode = typeof paymentModes[number];
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
