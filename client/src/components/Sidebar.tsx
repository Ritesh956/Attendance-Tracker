import { useTheme } from "@/components/ui/theme-provider";
import { Link } from "wouter";

interface SidebarProps {
  activeTab: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold font-mono text-primary-dark dark:text-primary">
          <span className="text-amber-500">₹</span> Chillar Tracker
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track your petty expenses efficiently</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <div 
          onClick={() => window.location.href = "/dashboard"}
          className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'dashboard' 
              ? 'bg-primary/20 text-primary font-medium' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          Dashboard
        </div>
        
        <div 
          onClick={() => window.location.href = "/expenses"}
          className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'expenses' 
              ? 'bg-primary/20 text-primary font-medium' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
          Expenses
        </div>
        
        <div 
          onClick={() => window.location.href = "/statistics"}
          className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'statistics' 
              ? 'bg-primary/20 text-primary font-medium' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          Statistics
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              theme === 'dark' ? 'bg-primary' : 'bg-gray-300'
            }`}
            aria-label="Toggle dark mode"
          >
            <span className="sr-only">Toggle Dark Mode</span>
            <span 
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            ></span>
          </button>
        </div>
      </div>
    </aside>
  );
}
