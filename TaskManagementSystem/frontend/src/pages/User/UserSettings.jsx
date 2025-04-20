import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';
import { 
  FiUser, 
  FiLock, 
  FiBell, 
  FiSun, 
  FiMoon, 
  FiCheck, 
  FiX, 
  FiUpload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Input from '../../components/Inputs/Input';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import ThemeToggle from '../../components/layouts/ThemeToggle';

const UserSettings = () => {
  const { user, updateUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
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
      setProfileImage(user.profileImageURL || null);
    }
  }, [user]);
  
  // Profile update handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage({
          file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
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
      
      if (profileImage && profileImage.file) {
        formData.append('profileImage', profileImage.file);
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
      
      // Update context with new user data
      updateUser({
        ...user,
        name: response.data.name,
        email: response.data.email,
        profileImageURL: response.data.profileImageURL
      });
      
      // Reset profile pic state
      setProfileImage(null);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
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
      await axiosInstance.post('/api/auth/change-password', {
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
      toast.error(error.response?.data?.message || 'Failed to change password');
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
      await axiosInstance.post('/api/users/notifications/settings', notificationSettings);
      toast.success('Notification settings saved');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  {profileImage?.preview ? (
                    <img 
                      src={profileImage.preview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={profileData.profileImageURL || 'https://via.placeholder.com/150?text=User'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <label 
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer"
                  htmlFor="profile-image"
                >
                  <FiUpload size={16} />
                </label>
                <input 
                  type="file" 
                  id="profile-image" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </div>
              <div>
                <h3 className="font-medium">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
            </div>
            
            <Input
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
              required
            />
            
            <div className="pt-4">
              <button
                type="submit"
                className="btn-primary px-6 py-2"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        );
        
      case 'password':
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your current password"
              required
            />
            
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
            />
            
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />
            
            <div className="pt-4">
              <button
                type="submit"
                className="btn-primary px-6 py-2"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email notifications</p>
              </div>
              <button
                onClick={() => handleToggleNotification('emailNotifications')}
                className={`w-14 h-7 rounded-full flex items-center p-1 transition-colors ${
                  notificationSettings.emailNotifications ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="bg-white w-5 h-5 rounded-full shadow"></div>
              </button>
            </div>
            
            <div className="space-y-4 pl-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">Task assigned</p>
                <button
                  onClick={() => handleToggleNotification('taskAssigned')}
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notificationSettings.taskAssigned ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm">Task updated</p>
                <button
                  onClick={() => handleToggleNotification('taskUpdated')}
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notificationSettings.taskUpdated ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm">Comment mention</p>
                <button
                  onClick={() => handleToggleNotification('commentMention')}
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notificationSettings.commentMention ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm">Deadline reminder</p>
                <button
                  onClick={() => handleToggleNotification('deadlineReminder')}
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notificationSettings.deadlineReminder ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow"></div>
                </button>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleSaveNotifications}
                className="btn-primary px-6 py-2"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-gray-500">Toggle between light and dark theme</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-14 h-7 rounded-full flex items-center p-1 transition-colors ${
                  darkMode ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="bg-white w-5 h-5 rounded-full shadow flex items-center justify-center">
                  {darkMode ? <FiMoon size={12} /> : <FiSun size={12} />}
                </div>
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FiUser />
                <span>Profile</span>
              </button>
              
              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'password' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FiLock />
                <span>Password</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FiBell />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${
                  activeTab === 'appearance' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {darkMode ? <FiMoon /> : <FiSun />}
                <span>Appearance</span>
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