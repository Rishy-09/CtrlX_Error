import React, { useState, useEffect, useRef } from 'react';
import { IoNotificationsOutline } from 'react-icons/io5';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [reminders, setReminders] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.REMINDERS.GET_USER_REMINDERS, {
        params: { isRead: false, active: true }
      });
      
      if (response.data?.reminders) {
        setReminders(response.data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (reminderId) => {
    try {
      await axiosInstance.put(API_PATHS.REMINDERS.MARK_REMINDER_READ(reminderId));
      // Remove from local state
      setReminders(prev => prev.filter(r => r._id !== reminderId));
    } catch (error) {
      console.error('Error marking reminder as read:', error);
    }
  };

  const handleNotificationClick = (reminder) => {
    // Mark as read
    markAsRead(reminder._id);
    
    // Navigate to task details
    const taskId = reminder.task._id;
    if (taskId) {
      navigate(`/user/tasks-details/${taskId}`);
    }
    
    // Close dropdown
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch reminders on component mount and every 5 minutes
  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-2 relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <IoNotificationsOutline className="text-xl" />
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {reminders.length > 9 ? '9+' : reminders.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
            ) : reminders.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
            ) : (
              reminders.map((reminder) => (
                <div 
                  key={reminder._id} 
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleNotificationClick(reminder)}
                >
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{reminder.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reminder.task?.title || 'Task'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {moment(reminder.reminderDate).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {reminders.length > 0 && (
            <div className="p-3 border-t text-center">
              <button 
                className="text-xs text-blue-500 hover:text-blue-700"
                onClick={() => {
                  // Mark all as read
                  reminders.forEach(r => markAsRead(r._id));
                }}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 