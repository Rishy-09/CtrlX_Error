import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const ReminderForm = ({ taskId, onReminderSet }) => {
  const [reminderDate, setReminderDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reminderDate) {
      toast.error('Please select a reminder date');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(API_PATHS.REMINDERS.CREATE_REMINDER, {
        taskId,
        reminderDate,
        message: message || 'Reminder for your task!'
      });

      if (response.status === 201) {
        toast.success('Reminder set successfully');
        // Reset form
        setReminderDate('');
        setMessage('');
        // Callback to parent component
        if (onReminderSet) {
          onReminderSet(response.data.reminder);
        }
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error(error.response?.data?.message || 'Failed to set reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-3 bg-indigo-50 rounded-md">
      <h3 className="text-xs font-medium text-slate-700 mb-2">Set Reminder</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs text-slate-600">Reminder Date</label>
            <input
              type="date"
              min={getTomorrowDate()}
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="text-xs text-slate-600">Message (Optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Custom reminder message"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !reminderDate}
            className={`px-4 py-2 text-sm bg-indigo-600 text-white rounded-md ${
              loading || !reminderDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Setting...' : 'Set Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm; 