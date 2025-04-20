import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ showLabel = false }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    // Apply the theme when component mounts and when darkMode changes
    applyTheme(darkMode);
  }, [darkMode]);

  const applyTheme = (isDark) => {
    // Update HTML class for Tailwind dark mode
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex items-center">
      {showLabel && (
        <div className="flex items-center mr-2">
          <FaSun className={`text-yellow-500 mr-2 ${darkMode ? 'opacity-50' : 'opacity-100'}`} />
          <span className="dark:text-white">Light</span>
        </div>
      )}
      
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
          darkMode ? 'bg-primary' : 'bg-gray-300'
        }`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            darkMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      {showLabel && (
        <div className="flex items-center ml-2">
          <FaMoon className={`text-blue-700 mr-2 ${darkMode ? 'opacity-100' : 'opacity-50'}`} />
          <span className="dark:text-white">Dark</span>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle; 