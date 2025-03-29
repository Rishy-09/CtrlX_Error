import { motion } from 'framer-motion';
import { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import useBugStore from '../store/bugStore';

export default function Reports({ userRole }) {
  const { bugs } = useBugStore();
  const [report, setReport] = useState({
    title: '',
    description: '',
    type: 'bug',
    severity: 'medium',
    steps: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle report submission based on user role
    console.log('Report submitted:', report);
    setReport({
      title: '',
      description: '',
      type: 'bug',
      severity: 'medium',
      steps: '',
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {userRole === 'tester' ? 'Report a Bug' : 'Submit Progress Report'}
            </h3>
            
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={report.title}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              {userRole === 'tester' && (
                <>
                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                      Severity
                    </label>
                    <select
                      id="severity"
                      name="severity"
                      value={report.severity}
                      onChange={(e) => setReport({ ...report, severity: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="steps" className="block text-sm font-medium text-gray-700">
                      Steps to Reproduce
                    </label>
                    <textarea
                      id="steps"
                      name="steps"
                      rows={4}
                      value={report.steps}
                      onChange={(e) => setReport({ ...report, steps: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="1. Navigate to...&#10;2. Click on...&#10;3. Observe that..."
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Submit Report
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Previous Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white shadow rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Previous Reports
            </h3>
            <div className="space-y-4">
              {bugs.map((bug) => (
                <div
                  key={bug.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{bug.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{bug.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bug.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      bug.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      bug.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {bug.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}