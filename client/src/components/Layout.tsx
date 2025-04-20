import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import ExpenseForm from "./ExpenseForm";
import { useLocation } from "wouter";
import { useExpenses } from "@/lib/hooks/use-expenses";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ 
  children
}: LayoutProps) {
  const { showExpenseForm, setShowExpenseForm } = useExpenses();
  const [location] = useLocation();
  // Extract the active tab from the location
  const activeTab = location.split('/')[1] || 'dashboard';
  
  return (
    <div className="min-h-screen font-sans">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm py-4 px-4 md:hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-mono text-primary dark:text-primary">
            <span className="text-amber-500">₹</span> Chillar Tracker
          </h1>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const html = document.documentElement;
              const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
              
              html.classList.remove(currentTheme);
              html.classList.add(newTheme);
              
              localStorage.setItem('chillar-theme', newTheme);
            }}
          >
            <svg 
              className="w-5 h-5 text-gray-700 dark:hidden" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
              />
            </svg>
            <svg 
              className="w-5 h-5 text-yellow-300 hidden dark:block" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar for desktop */}
        <Sidebar activeTab={activeTab} />
        
        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav activeTab={activeTab} />
      </div>
      
      {/* Add Expense Modal */}
      {showExpenseForm && (
        <ExpenseForm onClose={() => setShowExpenseForm(false)} />
      )}
    </div>
  );
}
