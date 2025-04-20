import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useDarkMode() {
  // Check if localStorage is available and get initial theme
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPreference = window.localStorage.getItem('chillar-theme');
      if (typeof storedPreference === 'string') {
        return storedPreference as Theme;
      }

      // Check for OS-level preference
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    // Default to light theme
    return 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Update theme in localStorage and apply to document
  const setThemeAndStore = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    // Remove the old theme class
    root.classList.remove(theme);
    
    // Add the new theme class
    root.classList.add(newTheme);
    
    // Store in localStorage
    localStorage.setItem('chillar-theme', newTheme);
    
    setTheme(newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setThemeAndStore(theme === 'dark' ? 'light' : 'dark');
  };

  // Apply theme on initial render
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add(theme);
    
    return () => {
      root.classList.remove(theme);
    };
  }, []);

  return { theme, setTheme: setThemeAndStore, toggleTheme };
}

export default useDarkMode;
