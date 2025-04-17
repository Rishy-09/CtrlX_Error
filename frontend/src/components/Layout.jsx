import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useHotkeys } from 'react-hotkeys-hook';
import SearchModal from './SearchModal';

// Helper hook to handle localStorage state management
const usePersistedState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export default function Layout({ children, userRole, setUserRole }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = usePersistedState('theme', 'light'); // Using the custom hook for theme
  const [sidebarWidth, setSidebarWidth] = usePersistedState('sidebarWidth', 256); // Using the custom hook for sidebar width

  // Keyboard shortcut for opening search modal
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  });

  return (
    <div className={`flex h-screen bg-gray-50 ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar 
        userRole={userRole} 
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          userRole={userRole} 
          setUserRole={setUserRole}
          theme={theme}
          setTheme={setTheme}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </div>
  );
}
