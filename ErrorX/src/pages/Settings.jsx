import { motion } from 'framer-motion';
import { useState } from 'react';
import { BellIcon, UserCircleIcon, KeyIcon, SunIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import useSettingsStore from '../store/settingsStore';
import { toast } from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: 'Chinese' },
];

export default function Settings() {
  const {
    theme,
    emailNotifications,
    pushNotifications,
    language,
    profile,
    setTheme,
    setNotificationPreference,
    setLanguage,
    updateProfile,
  } = useSettingsStore();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
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
            <form onSubmit={handleProfileUpdate} className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => updateProfile({ firstName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => updateProfile({ lastName: e.target.value })}
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
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-6">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
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
                  onClick={() => setNotificationPreference('emailNotifications', !emailNotifications)}
                  className={`${
                    emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  <span
                    className={`${
                      emailNotifications ? 'translate-x-5' : 'translate-x-0'
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
                  onClick={() => setNotificationPreference('pushNotifications', !pushNotifications)}
                  className={`${
                    pushNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  <span
                    className={`${
                      pushNotifications ? 'translate-x-5' : 'translate-x-0'
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
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          {/* Language Settings */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              Language
            </h3>
            <div className="mt-4">
              <select
                id="language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Settings */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              Security
            </h3>
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {isUpdating ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}