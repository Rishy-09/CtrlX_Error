import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChartBarIcon, UserGroupIcon, BugAntIcon } from '@heroicons/react/24/outline';
import useBugStore from '../store/bugStore';

export default function AdminDashboard() {
  const { bugs, assignBug } = useBugStore();
  const [teamStats] = useState({
    developers: [
      { id: 1, name: 'John Doe', assignedBugs: 5, resolvedBugs: 3 },
      { id: 2, name: 'Jane Smith', assignedBugs: 4, resolvedBugs: 2 },
    ],
    testers: [
      { id: 1, name: 'Alice Johnson', reportedBugs: 8, verifiedBugs: 5 },
      { id: 2, name: 'Bob Wilson', reportedBugs: 6, verifiedBugs: 4 },
    ],
  });

  const unassignedBugs = bugs.filter(bug => !bug.assignedTo && bug.status === 'Reported');

  const handleAssignBug = (bugId, developerId, developerName) => {
    assignBug(bugId, developerId, developerName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

        {/* Unassigned Bugs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Unassigned Bugs</h2>
            <div className="mt-4 space-y-4">
              {unassignedBugs.map((bug) => (
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
                        <span className="text-xs text-gray-500">
                          Reported: {new Date(bug.reportedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        onChange={(e) => {
                          const [developerId, developerName] = e.target.value.split('|');
                          handleAssignBug(bug.id, parseInt(developerId), developerName);
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign to developer</option>
                        {teamStats.developers.map((dev) => (
                          <option key={dev.id} value={`${dev.id}|${dev.name}`}>
                            {dev.name}
                          </option>
                        ))}
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

        {/* All Bugs Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">All Bugs Status</h2>
            <div className="mt-4 space-y-4">
              {bugs.map((bug) => (
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bug.status === 'Reported' ? 'bg-blue-100 text-blue-800' :
                          bug.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                          bug.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          bug.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bug.status}
                        </span>
                      </div>
                    </div>
                    {bug.assignedToName && (
                      <span className="text-sm text-gray-500">
                        Assigned to: {bug.assignedToName}
                      </span>
                    )}
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