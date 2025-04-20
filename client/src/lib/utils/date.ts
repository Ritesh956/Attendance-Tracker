import { format, formatDistanceToNow, isToday, isYesterday, differenceInDays } from 'date-fns';

/**
 * Format a date to a user-friendly string
 * @param date The date to format
 * @param formatStr The format string to use (from date-fns)
 * @returns The formatted date string
 */
export function formatDate(date: Date, formatStr: string): string {
  return format(date, formatStr);
}

/**
 * Format a currency value to a user-friendly string
 * @param value The currency value to format
 * @returns The formatted currency string
 */
export function formatCurrency(value: number): string {
  // Format with thousand separators
  return new Intl.NumberFormat('en-IN').format(Number(value.toFixed(2)));
}

/**
 * Get a relative time description of a date (e.g., "Today", "Yesterday", "3 days ago")
 * @param date The date to get the relative time for
 * @returns The relative time description
 */
export function getRelativeTime(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  // For dates within the last week, show "X days ago"
  const daysDifference = differenceInDays(new Date(), date);
  if (daysDifference < 7) {
    return `${daysDifference} days ago`;
  }
  
  // For older dates, return formatted date
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Gets the start of the current day
 * @returns Date object representing start of today
 */
export function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Gets the end of the current day
 * @returns Date object representing end of today
 */
export function getEndOfToday(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Gets the start of the current week (Sunday)
 * @returns Date object representing start of week
 */
export function getStartOfWeek(): Date {
  const today = new Date();
  const day = today.getDay(); // 0 is Sunday
  today.setDate(today.getDate() - day);
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Gets the end of the current week (Saturday)
 * @returns Date object representing end of week
 */
export function getEndOfWeek(): Date {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

/**
 * Gets the start of the current month
 * @returns Date object representing start of month
 */
export function getStartOfMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

/**
 * Gets the end of the current month
 * @returns Date object representing end of month
 */
export function getEndOfMonth(): Date {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  return endOfMonth;
}

/**
 * Gets the start of the previous month
 * @returns Date object representing start of last month
 */
export function getStartOfLastMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() - 1, 1);
}

/**
 * Gets the end of the previous month
 * @returns Date object representing end of last month
 */
export function getEndOfLastMonth(): Date {
  const today = new Date();
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  endOfLastMonth.setHours(23, 59, 59, 999);
  return endOfLastMonth;
}
