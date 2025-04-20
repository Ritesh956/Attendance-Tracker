import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { formatCurrency, formatDate } from "@/lib/utils/date";
import { Expense } from "@shared/schema";

// Register Chart.js components
Chart.register(...registerables);

// Category colors
const categoryColors = {
  "Food": "#6366F1", // Primary
  "Travel": "#F59E0B", // Amber
  "Fun": "#8B5CF6", // Purple
  "Study": "#10B981", // Green
  "Other": "#6B7280", // Gray
};

// Time period options
const timePeriods = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "3months", label: "Last 3 Months" },
  { value: "custom", label: "Custom" },
];

export default function Statistics() {
  const [activePeriod, setActivePeriod] = useState("week");
  
  // Chart refs
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const paymentMethodChartRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch summary data and expenses
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['/api/expenses/summary'],
  });
  
  const { data: expenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['/api/expenses'],
  });
  
  // Filter expenses based on the selected time period
  const getFilteredExpenses = () => {
    if (!expenses) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activePeriod === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return expenses.filter((expense: Expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfWeek && expenseDate <= endOfWeek;
      });
    }
    
    if (activePeriod === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      return expenses.filter((expense: Expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
      });
    }
    
    if (activePeriod === "last-month") {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      
      return expenses.filter((expense: Expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfLastMonth && expenseDate <= endOfLastMonth;
      });
    }
    
    if (activePeriod === "3months") {
      const startOfPeriod = new Date(today);
      startOfPeriod.setMonth(today.getMonth() - 3);
      
      return expenses.filter((expense: Expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfPeriod && expenseDate <= today;
      });
    }
    
    // Default: return all expenses
    return expenses;
  };
  
  // Calculate statistics for filtered expenses
  const calculateStats = () => {
    const filteredExpenses = getFilteredExpenses();
    
    if (filteredExpenses.length === 0) {
      return {
        totalSpending: 0,
        averageDaily: 0,
        highestExpense: {
          amount: 0,
          description: "N/A",
          date: new Date()
        },
        categoryDistribution: {},
        paymentDistribution: {
          "Cash": 0,
          "UPI": 0
        },
        topExpenses: []
      };
    }
    
    // Calculate total spending
    const totalSpending = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate date range for average
    const dates = filteredExpenses.map(expense => new Date(expense.date).toDateString());
    const uniqueDates = [...new Set(dates)];
    const averageDaily = uniqueDates.length > 0 ? totalSpending / uniqueDates.length : totalSpending;
    
    // Find highest expense
    const highestExpense = filteredExpenses.reduce((highest, expense) => {
      return expense.amount > highest.amount ? expense : highest;
    }, filteredExpenses[0]);
    
    // Calculate category distribution
    const categoryDistribution = filteredExpenses.reduce((dist, expense) => {
      dist[expense.category] = (dist[expense.category] || 0) + expense.amount;
      return dist;
    }, {} as Record<string, number>);
    
    // Calculate payment distribution
    const paymentDistribution = filteredExpenses.reduce((dist, expense) => {
      dist[expense.paymentMode] = (dist[expense.paymentMode] || 0) + expense.amount;
      return dist;
    }, {} as Record<string, number>);
    
    // Get top expenses
    const topExpenses = [...filteredExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return {
      totalSpending,
      averageDaily,
      highestExpense,
      categoryDistribution,
      paymentDistribution,
      topExpenses
    };
  };
  
  // Generate daily spending data for trend chart
  const generateDailyTrend = () => {
    const filteredExpenses = getFilteredExpenses();
    
    if (filteredExpenses.length === 0) {
      return {
        labels: [],
        data: []
      };
    }
    
    // Sort expenses by date
    const sortedExpenses = [...filteredExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get date range
    const startDate = new Date(sortedExpenses[0].date);
    const endDate = new Date(sortedExpenses[sortedExpenses.length - 1].date);
    
    // Generate all dates in the range
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate daily totals
    const dailyTotals = dates.map(date => {
      const dayExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        date,
        total
      };
    });
    
    return {
      labels: dailyTotals.map(day => formatDate(day.date, 'MMM d')),
      data: dailyTotals.map(day => day.total / 100) // Convert paise to rupees
    };
  };
  
  // Initialize charts when data is loaded
  useEffect(() => {
    if (!isExpensesLoading && expenses) {
      const stats = calculateStats();
      const trend = generateDailyTrend();
      
      // Cleanup previously created charts
      const cleanup = () => {
        const categoryChartInstance = Chart.getChart(categoryChartRef.current as HTMLCanvasElement);
        const trendChartInstance = Chart.getChart(trendChartRef.current as HTMLCanvasElement);
        const paymentMethodChartInstance = Chart.getChart(paymentMethodChartRef.current as HTMLCanvasElement);
        
        if (categoryChartInstance) {
          categoryChartInstance.destroy();
        }
        
        if (trendChartInstance) {
          trendChartInstance.destroy();
        }
        
        if (paymentMethodChartInstance) {
          paymentMethodChartInstance.destroy();
        }
      };
      
      cleanup();
      
      // Color configuration
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#D1D5DB' : '#4B5563';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      
      // Category distribution chart
      if (categoryChartRef.current) {
        const categories = Object.keys(stats.categoryDistribution);
        const data = categories.map(category => stats.categoryDistribution[category] / 100); // Convert paise to rupees
        const total = data.reduce((sum, value) => sum + value, 0);
        
        new Chart(categoryChartRef.current, {
          type: 'doughnut',
          data: {
            labels: categories,
            datasets: [{
              data,
              backgroundColor: categories.map(category => categoryColors[category] || '#6B7280'),
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.formattedValue;
                    const percentage = Math.round(((context.raw as number) / total) * 100) || 0;
                    return `${label}: ₹${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
      
      // Trend chart
      if (trendChartRef.current && trend.labels.length > 0) {
        new Chart(trendChartRef.current, {
          type: 'line',
          data: {
            labels: trend.labels,
            datasets: [{
              label: 'Daily Spending',
              data: trend.data,
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: textColor,
                }
              },
              y: {
                grid: {
                  color: gridColor,
                },
                ticks: {
                  color: textColor,
                  callback: function(value) {
                    return '₹' + value;
                  }
                }
              }
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `₹${context.formattedValue}`;
                  }
                }
              }
            }
          }
        });
      }
      
      // Payment method chart
      if (paymentMethodChartRef.current) {
        const paymentModes = Object.keys(stats.paymentDistribution);
        const data = paymentModes.map(mode => stats.paymentDistribution[mode] / 100); // Convert paise to rupees
        
        new Chart(paymentMethodChartRef.current, {
          type: 'doughnut',
          data: {
            labels: paymentModes,
            datasets: [{
              data,
              backgroundColor: [
                '#6366F1', // Primary (UPI)
                '#F59E0B', // Amber (Cash)
              ],
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false,
              }
            }
          }
        });
      }
      
      // Cleanup on unmount
      return cleanup;
    }
  }, [expenses, activePeriod]);
  
  // Calculate stats based on filtered expenses
  const stats = !isExpensesLoading && expenses ? calculateStats() : null;
  
  // Date range text for display
  const getDateRangeText = () => {
    const today = new Date();
    
    if (activePeriod === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${formatDate(startOfWeek, 'MMM d')} - ${formatDate(endOfWeek, 'MMM d, yyyy')}`;
    }
    
    if (activePeriod === "month") {
      return formatDate(today, 'MMMM yyyy');
    }
    
    if (activePeriod === "last-month") {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      return formatDate(lastMonth, 'MMMM yyyy');
    }
    
    if (activePeriod === "3months") {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      return `${formatDate(threeMonthsAgo, 'MMM d')} - ${formatDate(today, 'MMM d, yyyy')}`;
    }
    
    return "All Time";
  };
  
  return (
    <section className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Statistics</h2>
      </div>
      
      {/* Time Period Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {timePeriods.map((period) => (
            <button
              key={period.value}
              onClick={() => setActivePeriod(period.value)}
              className={`py-2 px-4 rounded-lg ${
                activePeriod === period.value
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spending</h3>
          <p className="mt-2 text-2xl font-bold font-mono">
            {isExpensesLoading ? (
              <span className="animate-pulse">₹---</span>
            ) : (
              `₹${formatCurrency(stats?.totalSpending ? stats.totalSpending : 0)}`
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{getDateRangeText()}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Daily</h3>
          <p className="mt-2 text-2xl font-bold font-mono">
            {isExpensesLoading ? (
              <span className="animate-pulse">₹---</span>
            ) : (
              `₹${formatCurrency(stats?.averageDaily ? stats.averageDaily : 0)}`
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {getFilteredExpenses().length > 0 
              ? `${new Set(getFilteredExpenses().map(e => new Date(e.date).toDateString())).size} days`
              : "No data"
            }
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Expense</h3>
          <p className="mt-2 text-2xl font-bold font-mono">
            {isExpensesLoading ? (
              <span className="animate-pulse">₹---</span>
            ) : stats?.highestExpense?.amount ? (
              `₹${formatCurrency(stats.highestExpense.amount)}`
            ) : (
              "₹0"
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isExpensesLoading ? (
              "Loading..."
            ) : stats?.highestExpense?.description ? (
              `${stats.highestExpense.description} on ${formatDate(new Date(stats.highestExpense.date), 'dd MMM')}`
            ) : (
              "No data"
            )}
          </p>
        </div>
      </div>
      
      {/* Detailed Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Spending by Category</h3>
          <div className="chart-container" style={{ height: '220px', position: 'relative' }}>
            {isExpensesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : getFilteredExpenses().length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No data available for this period
              </div>
            ) : (
              <canvas ref={categoryChartRef} id="statsCategoryChart"></canvas>
            )}
          </div>
          
          {/* Legend */}
          {!isExpensesLoading && stats && Object.keys(stats.categoryDistribution).length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(stats.categoryDistribution).map(([category, amount]) => {
                const total = Object.values(stats.categoryDistribution).reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                
                return (
                  <div key={category} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                    ></div>
                    <span className="text-xs">{category} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Daily Spending Trend</h3>
          <div className="chart-container" style={{ height: '220px', position: 'relative' }}>
            {isExpensesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : getFilteredExpenses().length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No data available for this period
              </div>
            ) : (
              <canvas ref={trendChartRef} id="statsTrendChart"></canvas>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment Method Chart and Top Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Payment Method Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Spending by Payment Method</h3>
          {isExpensesLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : getFilteredExpenses().length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
              No data available for this period
            </div>
          ) : (
            <div className="flex">
              <div className="w-1/3">
                <div className="chart-container h-40">
                  <canvas ref={paymentMethodChartRef} id="paymentMethodChart"></canvas>
                </div>
              </div>
              <div className="w-2/3 pl-4 flex flex-col justify-center">
                {stats && Object.entries(stats.paymentDistribution).map(([mode, amount]) => {
                  const total = Object.values(stats.paymentDistribution).reduce((sum, val) => sum + val, 0);
                  const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                  
                  return (
                    <div key={mode} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: mode === "UPI" ? "#6366F1" : "#F59E0B" }}
                          ></div>
                          <span className="text-sm">{mode}</span>
                        </div>
                        <span className="text-sm font-mono font-medium">
                          ₹{formatCurrency(amount)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${mode === "UPI" ? "bg-primary" : "bg-amber-500"} h-2 rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Top Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top Expenses</h3>
          {isExpensesLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : stats?.topExpenses.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
              No data available for this period
            </div>
          ) : (
            <ul className="space-y-3">
              {stats?.topExpenses.map((expense) => (
                <li key={expense.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(new Date(expense.date), 'dd MMM')} • {expense.category}
                    </p>
                  </div>
                  <span className="font-mono font-medium">₹{formatCurrency(expense.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Export Options */}
      <div className="flex justify-end">
        <button className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 py-2 px-4 rounded-lg flex items-center mr-2">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
        <button className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 py-2 px-4 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>
    </section>
  );
}
