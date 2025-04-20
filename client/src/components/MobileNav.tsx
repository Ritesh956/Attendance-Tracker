import { Link } from "wouter";

interface MobileNavProps {
  activeTab: string;
}

export default function MobileNav({ activeTab }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex justify-around">
        <div 
          onClick={() => window.location.href = "/dashboard"}
          className={`flex flex-col items-center justify-center py-2 w-1/3 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          <span className="text-xs mt-1">Dashboard</span>
        </div>
        
        <div 
          onClick={() => window.location.href = "/expenses"}
          className={`flex flex-col items-center justify-center py-2 w-1/3 cursor-pointer ${
            activeTab === 'expenses' ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
          <span className="text-xs mt-1">Expenses</span>
        </div>
        
        <div 
          onClick={() => window.location.href = "/statistics"}
          className={`flex flex-col items-center justify-center py-2 w-1/3 cursor-pointer ${
            activeTab === 'statistics' ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          <span className="text-xs mt-1">Stats</span>
        </div>
      </div>
    </nav>
  );
}
