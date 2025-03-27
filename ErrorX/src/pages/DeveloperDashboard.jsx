import { motion } from 'framer-motion';
import { useState } from 'react';
import { ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import useBugStore from '../store/bugStore';

export default function DeveloperDashboard() {
  const { bugs, updateBugStatus } = useBugStore();
  const [timer, setTimer] = useState({ active: false, time: 0 });
  const [timerInterval, setTimerInterval] = useState(null);

  // Filter bugs assigned to this developer (in a real app, this would use the actual developer's ID)
  const assignedBugs = bugs.filter(bug => bug.assignedTo === 1);

  const handleStatusChange = (bugId, newStatus) => {
    updateBugStatus(bugId, newStatus, 'Developer');
  };

  const toggleTimer = () => {
    if (timer.active) {
      clearInterval(timerInterval);
      setTimer({ ...timer, active: false });
    } else {
      const interval = setInterval(() => {
        setTimer(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
      setTimerInterval(interval);
      setTimer({ ...timer, active: true });
    }
  };

  const resetTimer = () => {
    clearInterval(timerInterval);
    setTimer({ active: false, time: 0 });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Developer Dashboard</h1>

        {/* Assigned Bugs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Assigned Bugs</h2>
            <div className="mt-4 space-y-4">
              {assignedBugs.map((bug) => (
                <motion.div
                  key={bug.id}
                  whileHover={{ scale: 1.01 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{bug.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{bug.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bug.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          bug.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {bug.severity}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={bug.status}
                        onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Bug Timeline */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
                    <div className="space-y-3">
                      {bug.timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-500" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {event.status}
                              {event.assignedTo && ` - Assigned to ${event.assignedTo}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {event.date} by {event.user}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Work Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Work Timer</h2>
            <div className="mt-4">
              <div className="text-3xl font-bold text-center text-gray-900">
                {formatTime(timer.time)}
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className={`px-4 py-2 rounded-md text-white ${
                    timer.active ? 'bg-red-600' : 'bg-primary-600'
                  }`}
                >
                  {timer.active ? 'Stop' : 'Start'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md"
                >
                  Reset
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}