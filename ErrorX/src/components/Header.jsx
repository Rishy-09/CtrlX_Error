import { useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import NotificationSidebar from './NotificationSidebar';
import useNotificationStore from '../store/notificationStore';

export default function Header({ userRole, setUserRole }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-1 flex items-center">
            <motion.div 
              className={`max-w-lg w-full lg:max-w-xs ${searchFocused ? 'flex-1' : ''}`}
              animate={{ width: searchFocused ? '100%' : '300px' }}
              transition={{ duration: 0.2 }}
            >
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search issues..."
                  type="search"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </motion.div>
          </div>

          <div className="ml-4 flex items-center md:ml-6">
            {/* Role Switcher (for demo purposes) */}
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="mr-4 text-sm border-gray-300 rounded-md"
            >
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
            </select>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setIsNotificationOpen(true)}
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="ml-3 relative"
            >
              <div>
                <button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <NotificationSidebar
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </header>
  );
}