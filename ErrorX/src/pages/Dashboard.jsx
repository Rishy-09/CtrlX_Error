import { motion } from 'framer-motion';
import { ChartBarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Issues', stat: '71,897', icon: ExclamationTriangleIcon, change: '12%', changeType: 'increase' },
  { name: 'Avg. Resolution Time', stat: '58.16%', icon: ClockIcon, change: '2.02%', changeType: 'decrease' },
  { name: 'Sprint Progress', stat: '24.57%', icon: ChartBarIcon, change: '4.05%', changeType: 'increase' },
];

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <motion.div
                key={item.name}
                className="bg-white overflow-hidden shadow rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{item.stat}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.changeType === 'increase' ? '↑' : '↓'} {item.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              <div className="mt-5">
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {[1, 2, 3].map((item) => (
                      <motion.li
                        key={item}
                        className="py-5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: item * 0.1 }}
                      >
                        <div className="relative focus-within:ring-2 focus-within:ring-primary-500">
                          <h4 className="text-sm font-semibold text-gray-800">
                            Bug fix: Navigation menu not responding on mobile devices
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            Fixed the responsive navigation menu issue that was preventing users from accessing the menu on mobile devices.
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}