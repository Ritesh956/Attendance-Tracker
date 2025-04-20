import { useQuery } from "@tanstack/react-query";
import { useExpenses } from "@/lib/hooks/use-expenses";
import { formatCurrency, formatDate, getRelativeTime } from "@/lib/utils/date";
import { Expense } from "@shared/schema";
import { useContext, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { Link } from "wouter";

// Register Chart.js components
Chart.register(...registerables);

// Category and payment mode icons
const categoryIcons = {
  "Food": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  "Travel": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  "Fun": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  "Study": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  ),
  "Other": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
};

const categoryColors = {
  "Food": "bg-primary bg-opacity-10 text-primary-dark dark:text-primary",
  "Travel": "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300",
  "Fun": "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300",
  "Study": "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300",
  "Other": "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
};

export default function Dashboard() {
  const { showExpenseForm, setShowExpenseForm } = useExpenses();
  
  // Chart refs
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const weeklyChartRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch summary data and expenses
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['/api/expenses/summary'],
  });
  
  const { data: expenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['/api/expenses'],
  });
  
  // Initialize charts when data is loaded
  useEffect(() => {
    if (summary && categoryChartRef.current && weeklyChartRef.current) {
      // Cleanup previously created charts
      const cleanup = () => {
        const categoryChartInstance = Chart.getChart(categoryChartRef.current as HTMLCanvasElement);
        const weeklyChartInstance = Chart.getChart(weeklyChartRef.current as HTMLCanvasElement);
        
        if (categoryChartInstance) {
          categoryChartInstance.destroy();
        }
        
        if (weeklyChartInstance) {
          weeklyChartInstance.destroy();
        }
      };
      
      cleanup();
      
      // Color configuration
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#D1D5DB' : '#4B5563';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      
      // Category distribution chart
      const categoryData = {
        Food: summary.week.categoryDistribution.Food || 0,
        Travel: summary.week.categoryDistribution.Travel || 0,
        Fun: summary.week.categoryDistribution.Fun || 0,
        Study: summary.week.categoryDistribution.Study || 0,
        Other: summary.week.categoryDistribution.Other || 0,
      };
      
      new Chart(categoryChartRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryData),
          datasets: [{
            data: Object.values(categoryData),
            backgroundColor: [
              '#6366F1', // Primary (Food)
              '#F59E0B', // Amber (Travel)
              '#8B5CF6', // Purple (Fun)
              '#10B981', // Green (Study)
              '#6B7280', // Gray (Other)
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
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.formattedValue;
                  const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
                  const percentage = Math.round(((context.raw as number) / total) * 100);
                  return `${label}: ₹${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
      
      // Weekly spending chart
      const dailyTotals = summary.dailyTotals || [];
      
      // Extract dates for labels and totals for data
      const labels = dailyTotals.map(day => formatDate(new Date(day.date), 'MMM d'));
      const data = dailyTotals.map(day => day.total / 100); // Convert paise to rupees
      
      new Chart(weeklyChartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Daily Spending',
            data,
            backgroundColor: '#6366F1',
            borderRadius: 4,
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
      
      // Cleanup on unmount
      return cleanup;
    }
  }, [summary]);
  
  // Get recent transactions (top 3)
  const recentTransactions = expenses && expenses.length > 0 
    ? expenses.slice(0, 3) 
    : [];
    
  return (
    <section className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button 
          onClick={() => setShowExpenseForm(true)}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Expense
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Today's Spending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Spending</h3>
          <p className="mt-2 text-2xl font-bold font-mono">
            {isSummaryLoading 
              ? <span className="animate-pulse">₹---</span>
              : `₹${formatCurrency(summary?.today.total / 100)}`
            }
          </p>
          <div className="mt-2 flex items-center text-xs">
            {isSummaryLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              summary?.today.percentChange < 0 ? (
                <span className="text-green-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{Math.abs(summary.today.percentChange)}% less than average</span>
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span>{summary.today.percentChange}% more than average</span>
                </span>
              )
            )}
          </div>
        </div>
        
        {/* This Week */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</h3>
          <p className="mt-2 text-2xl font-bold font-mono">
            {isSummaryLoading 
              ? <span className="animate-pulse">₹---</span>
              : `₹${formatCurrency(summary?.week.total / 100)}`
            }
          </p>
          <div className="mt-2 flex items-center text-xs">
            {isSummaryLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              summary?.week.percentChange < 0 ? (
                <span className="text-green-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{Math.abs(summary.week.percentChange)}% less than last week</span>
                </span>
              ) : (
                <span className="text-amber-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span>{summary.week.percentChange}% more than last week</span>
                </span>
              )
            )}
          </div>
        </div>
        
        {/* This Month */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</h3>
          <p className="mt-2 text-2xl font-bold font-mono">
            {isSummaryLoading 
              ? <span className="animate-pulse">₹---</span>
              : `₹${formatCurrency(summary?.month.total / 100)}`
            }
          </p>
          <div className="mt-2 flex items-center text-xs">
            {isSummaryLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              summary?.month.percentChange < 0 ? (
                <span className="text-green-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{Math.abs(summary.month.percentChange)}% less than last month</span>
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span>{summary.month.percentChange}% more than last month</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Spending by Category</h3>
          <div className="chart-container" style={{ height: '220px', position: 'relative' }}>
            {isSummaryLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <canvas ref={categoryChartRef} id="categoryChart"></canvas>
            )}
          </div>
        </div>
        
        {/* Weekly Spending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Last 7 Days</h3>
          <div className="chart-container" style={{ height: '220px', position: 'relative' }}>
            {isSummaryLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <canvas ref={weeklyChartRef} id="weeklyChart"></canvas>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-medium">Recent Transactions</h3>
          <div 
            onClick={() => window.location.href = "/expenses"}
            className="text-primary text-sm hover:underline cursor-pointer"
          >
            View All
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isExpensesLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading recent transactions...</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No transactions yet. Add your first expense!</p>
              <button
                onClick={() => setShowExpenseForm(true)}
                className="mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </div>
          ) : (
            recentTransactions.map((expense: Expense) => (
              <div 
                key={expense.id} 
                className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryColors[expense.category]} mr-3`}>
                    {categoryIcons[expense.category]}
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRelativeTime(new Date(expense.date))} • {expense.category} • {expense.paymentMode}
                    </p>
                  </div>
                </div>
                <p className="font-mono font-medium">₹{formatCurrency(expense.amount / 100)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
