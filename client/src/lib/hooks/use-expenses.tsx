import React, { useContext, createContext, useState, ReactNode } from 'react';

// Define the context type
interface ExpenseContextType {
  showExpenseForm: boolean;
  setShowExpenseForm: (show: boolean) => void;
}

// Create the context with default values
const ExpenseContext = createContext<ExpenseContextType>({
  showExpenseForm: false,
  setShowExpenseForm: () => {},
});

// Provider component
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <ExpenseContext.Provider 
      value={{ 
        showExpenseForm, 
        setShowExpenseForm 
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

// Hook to use the expense context
export function useExpenses() {
  const context = useContext(ExpenseContext);
  
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  
  return context;
}
