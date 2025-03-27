import { motion } from 'framer-motion';
import { useState } from 'react';
import { BugAntIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import useBugStore from '../store/bugStore';

export default function TesterDashboard() {
  const { bugs, addBug } = useBugStore();
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    severity: 'High',
    reproducibility: 'Always'
  });

  const reportedBugs = bugs.filter(bug => bug.reportedBy === 'Tester');

  const handleSubmit = (e) => {
    e.preventDefault();
    addBug({
      ...newBug,
      reportedBy: 'Tester',
      reportedDate: new Date().toISOString()
    });
    setNewBug({
      title: '',
      description: '',
      severity: 'High',
      reproducibility: 'Always'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tester Dashboard</h1>

        {/* Report New Bug */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Report New Bug</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="bug-title" className="block text-sm font-medium text-gray-700">
                  Bug Title
                </label>
                <input
                  type="text"
                  id="bug-title"
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                    Severity
                  </label>
                  <select
                    id="severity"
                    value={newBug.severity}
                    onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="reproducibility" className="block text-sm font-medium text-gray-700">
                    Reproducibility
                  </label>
                  <select
                    id="reproducibility"
                    value={newBug.reproducibility}
                    onChange={(e) => setNewBug({ ...newBug, reproducibility: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option>Always</option>
                    <option>Sometimes</option>
                    <option>Rarely</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Report Bug
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Reported Bugs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Reported Bugs</h2>
            <div className="mt-4 space-y-4">
              {reportedBugs.map((bug) => (
                <motion.div
                  key={bug.id}
                  whileHover={{ scale: 1.01 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{bug.title}</h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bug.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          bug.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {bug.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          Reported: {new Date(bug.reportedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bug.status === 'Reported' ? 'bg-blue-100 text-blue-800' :
                        bug.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                        bug.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        bug.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bug.status}
                      </span>
                      {bug.assignedToName && (
                        <span className="text-xs text-gray-500 mt-1">
                          Assigned to: {bug.assignedToName}
                        </span>
                      )}
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
      </div>
    </motion.div>
  );
}