import { motion } from 'framer-motion';
import { useState } from 'react';
import { BellIcon, UserCircleIcon, KeyIcon, SunIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    theme: 'light',
    language: 'en',
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg divide-y divide-gray-200"
        >
          {/* Profile Settings */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              Profile Settings
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <BellIcon className="h-5 w-5 mr-2" />
              Notification Settings
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Email notifications</span>
                  <span className="text-sm text-gray-500">Receive email updates about your bugs</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                  className={`${
                    settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  <span
                    className={`${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Push notifications</span>
                  <span className="text-sm text-gray-500">Receive push notifications in your browser</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
                  className={`${
                    settings.pushNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  <span
                    className={`${
                      settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <SunIcon className="h-5 w-5 mr-2" />
              Appearance
            </h3>
            <div className="mt-4">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {/* Security Settings */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              Security
            </h3>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Change Password
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}