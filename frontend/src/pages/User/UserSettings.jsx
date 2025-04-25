import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../../context/userContext';
import { 
  FiUser, 
  FiLock, 
  FiBell, 
  FiSun, 
  FiCheck, 
  FiUpload,
  FiEdit2,
  FiSave
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Input from '../../components/Inputs/Input';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';

const UserSettings = () => {
  const { user, updateUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profileImageURL: user?.profileImageURL || ''
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskAssigned: true,
    taskUpdated: true,
    commentMention: true,
    deadlineReminder: true
  });
  
  useEffect(() => {
    // Apply theme on initial load and changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  useEffect(() => {
    // Update profile data when user changes
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        profileImageURL: user.profileImageURL || ''
      });
      setPreviewUrl(user.profileImageURL || null);
    }

    // Cleanup preview URL when component unmounts
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [user]);
  
  // Profile update handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileImageChange = (file) => {
    if (file) {
      // Revoke previous preview URL to avoid memory leaks
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create a new preview URL
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      
      // Set the profile image file for upload
      setProfileImage(file);
    }
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Check for response data structure
      const userData = response.data.user || response.data;
      
      // Update context with new user data
      updateUser({
        ...user,
        name: userData.name,
        email: userData.email,
        profileImageURL: userData.profileImageURL || userData.profileImageUrl
      });
      
      // Update local state
      setProfileData({
        name: userData.name,
        email: userData.email,
        profileImageURL: userData.profileImageURL || userData.profileImageUrl
      });
      
      // Reset profile pic state but keep the current image URL
      setProfileImage(null);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD + '/authenticated', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Current password is incorrect');
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Notification settings handlers
  const handleToggleNotification = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleSaveNotifications = async () => {
    setLoading(true);
    
    try {
      // Save notification settings to backend
      const response = await axiosInstance.put(`${API_PATHS.USERS.UPDATE_USER(user._id)}/notification-settings`, {
        settings: notificationSettings
      });
      
      if (response.data) {
        toast.success('Notification settings saved');
        
        // If the backend returns updated settings, update local state
        if (response.data.settings) {
          setNotificationSettings(response.data.settings);
        }
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      if (error.response) {
        if (error.response.status === 404) {
          toast.error('User not found. Please reload the page or log in again.');
        } else {
          toast.error(error.response.data?.message || 'Failed to save notification settings');
        }
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error('Failed to save notification settings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Theme toggle handler
  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply theme change
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Show confirmation
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} theme activated`);
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Profile Information</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-md">
                    <img 
                      src={previewUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "User") + "&background=random"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "User") + "&background=random";
                      }}
                    />
                  </div>
                  <label 
                    className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors"
                    htmlFor="profile-image"
                    title="Change profile photo"
                  >
                    <FiEdit2 size={16} />
                  </label>
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleProfileImageChange(e.target.files[0])}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">{user?.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user?.role}</p>
                  {profileImage && (
                    <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <FiCheck className="mr-1" /> New image selected
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={loading}
                >
                  <FiSave className="mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        );
        
      case 'password':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={loading}
                >
                  <FiLock className="mr-2" />
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        );
        
      case 'appearance':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Appearance Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Theme Settings</h3>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                  </div>
                  
                  <button 
                    onClick={handleThemeToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    role="switch"
                    aria-checked={darkMode}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your theme preference is saved automatically and will be applied when you visit again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle email notifications"
                    role="switch"
                    aria-checked={notificationSettings.emailNotifications}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="mt-6 space-y-4 pl-4">
                  <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Task assigned</p>
                    <button
                      onClick={() => handleToggleNotification('taskAssigned')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        notificationSettings.taskAssigned ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle task assigned notifications"
                      role="switch"
                      aria-checked={notificationSettings.taskAssigned}
                      disabled={!notificationSettings.emailNotifications}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          notificationSettings.taskAssigned ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Task updated</p>
                    <button
                      onClick={() => handleToggleNotification('taskUpdated')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        notificationSettings.taskUpdated ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle task updated notifications"
                      role="switch"
                      aria-checked={notificationSettings.taskUpdated}
                      disabled={!notificationSettings.emailNotifications}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          notificationSettings.taskUpdated ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Comment mention</p>
                    <button
                      onClick={() => handleToggleNotification('commentMention')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        notificationSettings.commentMention ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle comment mention notifications"
                      role="switch"
                      aria-checked={notificationSettings.commentMention}
                      disabled={!notificationSettings.emailNotifications}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          notificationSettings.commentMention ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Deadline reminder</p>
                    <button
                      onClick={() => handleToggleNotification('deadlineReminder')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        notificationSettings.deadlineReminder ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle deadline reminder notifications"
                      role="switch"
                      aria-checked={notificationSettings.deadlineReminder}
                      disabled={!notificationSettings.emailNotifications}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          notificationSettings.deadlineReminder ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveNotifications}
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={loading}
                >
                  <FiSave className="mr-2" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FiUser className={activeTab === 'profile' ? 'text-blue-600 dark:text-blue-400' : ''} />
                <span>Profile</span>
              </button>
              
              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'password' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FiLock className={activeTab === 'password' ? 'text-blue-600 dark:text-blue-400' : ''} />
                <span>Password</span>
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'appearance' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FiSun className={activeTab === 'appearance' ? 'text-blue-600 dark:text-blue-400' : ''} />
                <span>Appearance</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FiBell className={activeTab === 'notifications' ? 'text-blue-600 dark:text-blue-400' : ''} />
                <span>Notifications</span>
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings; 