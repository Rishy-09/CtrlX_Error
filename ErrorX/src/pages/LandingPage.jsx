import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BugAntIcon, ShieldCheckIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 w-full h-full">
          <div className="relative h-full">
            <svg
              className="absolute right-full transform translate-x-1/4 translate-y-1/4 lg:translate-x-1/2 xl:translate-x-full"
              width={404}
              height={784}
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="pattern-1"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect x={0} y={0} width={4} height={4} className="text-purple-100" fill="currentColor" />
                </pattern>
              </defs>
              <rect width={404} height={784} fill="url(#pattern-1)" />
            </svg>
          </div>
        </div>

        <div className="relative pt-6 pb-16 sm:pb-24">
          <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6" aria-label="Global">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full md:w-auto">
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <BugAntIcon className="h-8 w-auto text-purple-600" />
                  <span className="ml-2 text-2xl font-bold text-gray-900">BugFlow</span>
                </motion.div>
              </div>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link to="/login" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Start free trial
              </Link>
            </div>
          </nav>

          <div className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6">
            <div className="text-center">
              <motion.h1
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="block">Transform Your</span>
                <span className="block text-purple-600">Bug Tracking Experience</span>
              </motion.h1>
              <motion.p
                className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Streamline your development workflow with our powerful bug tracking solution. 
                Track, manage, and resolve issues efficiently in one collaborative platform.
              </motion.p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get started
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative bg-white py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
            <motion.h2
              className="text-base font-semibold uppercase tracking-wider text-purple-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Everything you need
            </motion.h2>
            <motion.p
              className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Built for modern development teams
            </motion.p>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    className="pt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-purple-600 rounded-md shadow-lg">
                            <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                        <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-purple-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl font-extrabold text-white sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="block">Ready to dive in?</span>
              <span className="block">Start your free trial today.</span>
            </motion.h2>
            <motion.p
              className="mt-4 text-lg leading-6 text-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of teams already using BugFlow to improve their development workflow.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 w-full sm:flex sm:justify-center"
            >
              <Link
                to="/signup"
                className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-md font-medium inline-flex items-center"
              >
                Start free trial
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Real-time Collaboration',
    description: 'Work together seamlessly with your team. Get instant updates and notifications as changes happen.',
    icon: BoltIcon,
  },
  {
    name: 'Advanced Security',
    description: 'Enterprise-grade security with role-based access control and audit logs.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Powerful Analytics',
    description: 'Gain insights into your project health with detailed reports and dashboards.',
    icon: ChartBarIcon,
  },
];