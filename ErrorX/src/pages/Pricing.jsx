import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Starter',
    href: '/signup',
    priceMonthly: 0,
    description: 'Perfect for small teams and individual developers.',
    features: [
      'Up to 5 team members',
      'Basic bug tracking',
      'Email support',
      '1GB storage',
      'Basic reporting'
    ],
  },
  {
    name: 'Professional',
    href: '/signup',
    priceMonthly: 49,
    description: 'Ideal for growing teams and organizations.',
    features: [
      'Up to 20 team members',
      'Advanced bug tracking',
      'Priority email support',
      '10GB storage',
      'Advanced analytics',
      'Custom fields',
      'API access'
    ],
  },
  {
    name: 'Enterprise',
    href: '/signup',
    priceMonthly: 99,
    description: 'For large organizations with complex needs.',
    features: [
      'Unlimited team members',
      'Enterprise bug tracking',
      '24/7 phone & email support',
      'Unlimited storage',
      'Custom analytics',
      'SSO integration',
      'Custom workflows',
      'Dedicated account manager'
    ],
  },
];

export default function Pricing() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <motion.h1
            className="text-5xl font-extrabold text-gray-900 sm:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Pricing Plans
          </motion.h1>
          <motion.p
            className="mt-5 text-xl text-gray-500 sm:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Choose the perfect plan for your team
          </motion.p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">{tier.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${tier.priceMonthly}</span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <Link
                  to={tier.href}
                  className="mt-8 block w-full bg-purple-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-purple-700"
                >
                  Get started
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-purple-500" aria-hidden="true" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}