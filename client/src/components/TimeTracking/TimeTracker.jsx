import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaStop, FaHistory } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import moment from 'moment';

const TimeTracker = ({ taskId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timerValue, setTimerValue] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const timerInterval = useRef(null);
  const timerStartTime = useRef(null);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TIME_ENTRIES(taskId));
      
      if (response.data) {
        setTimeEntries(response.data.timeEntries || []);
        setTotalTimeSpent(response.data.totalTimeSpent || 0);
        
        // Check if there is an active time entry
        const activeEntry = response.data.timeEntries.find(entry => !entry.endTime);
        if (activeEntry) {
          setIsTracking(true);
          timerStartTime.current = new Date(activeEntry.startTime);
          const elapsedSeconds = Math.floor((new Date() - timerStartTime.current) / 1000);
          setTimerValue(elapsedSeconds);
          startTimer();
        }
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast.error('Failed to load time tracking data');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    timerInterval.current = setInterval(() => {
      setTimerValue(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const handleStartTracking = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        API_PATHS.TASKS.START_TIME_TRACKING(taskId),
        { description }
      );
      
      if (response.data) {
        toast.success('Time tracking started');
        setIsTracking(true);
        timerStartTime.current = new Date();
        setTimerValue(0);
        startTimer();
        setDescription('');
        
        // Refresh time entries
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Error starting time tracking:', error);
      toast.error(error.response?.data?.message || 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTracking = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        API_PATHS.TASKS.STOP_TIME_TRACKING(taskId)
      );
      
      if (response.data) {
        toast.success('Time tracking stopped');
        setIsTracking(false);
        stopTimer();
        setTimerValue(0);
        
        // Update total time spent
        setTotalTimeSpent(response.data.totalTimeSpent || 0);
        
        // Refresh time entries
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      toast.error(error.response?.data?.message || 'Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTimeEntries();
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [taskId]);

  return (
    <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-xs font-medium">Time Tracking</h3>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
              {formatTime(timerValue)}
            </div>
            
            <div className="ml-3 text-xs text-gray-500">
              Total: {formatDuration(totalTimeSpent)}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isTracking ? (
              <button 
                className="bg-red-100 text-red-600 flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200"
                onClick={handleStopTracking}
                disabled={loading}
              >
                <FaStop size={12} />
                Stop
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 w-full sm:w-40"
                />
                
                <button 
                  className="bg-green-100 text-green-600 flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium hover:bg-green-200"
                  onClick={handleStartTracking}
                  disabled={loading}
                >
                  <FaPlay size={12} />
                  Start
                </button>
              </>
            )}
            
            <button 
              className="bg-gray-100 text-gray-600 flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-200"
              onClick={() => setShowHistory(!showHistory)}
            >
              <FaHistory size={12} />
              {showHistory ? 'Hide' : 'History'}
            </button>
          </div>
        </div>
        
        {showHistory && (
          <div className="mt-3">
            <h4 className="text-xs font-medium mb-2">Time Entry History</h4>
            {timeEntries.length === 0 ? (
              <p className="text-xs text-gray-500">No time entries yet</p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {timeEntries.map((entry, index) => (
                  <div 
                    key={index} 
                    className="bg-white border border-gray-100 rounded-md p-2 mb-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium">
                          {entry.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {moment(entry.startTime).format('MMM DD, YYYY HH:mm')}
                          {entry.endTime && ` - ${moment(entry.endTime).format('HH:mm')}`}
                        </p>
                      </div>
                      <div className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-xs">
                        {entry.endTime ? formatDuration(entry.duration) : 'In progress'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker; 