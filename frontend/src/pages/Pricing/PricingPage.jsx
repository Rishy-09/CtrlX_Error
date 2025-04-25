import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Footer from '../../components/layouts/Footer';
import Navbar from '../../components/layouts/Navbar';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly');
  };
  
  // Define pricing tiers
  const pricingTiers = [
    {
      name: 'Free',
      description: 'For individuals and small projects',
      price: {
        monthly: 0,
        annually: 0
      },
      features: [
        { name: 'Up to a 5 users', included: true },
        { name: 'Up to 20 tasks', included: true },
        { name: 'Basic bug tracking', included: true },
        { name: 'Chat with team members', included: true },
        { name: 'Basic reporting', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Priority support', included: false },
        { name: 'AI assistant', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom integrations', included: false }
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      description: 'For growing teams and organizations',
      price: {
        monthly: 12,
        annually: 9
      },
      features: [
        { name: 'Up to 20 users', included: true },
        { name: 'Unlimited tasks', included: true },
        { name: 'Advanced bug tracking', included: true },
        { name: 'Chat with team members', included: true },
        { name: 'Advanced reporting', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Priority support', included: true },
        { name: 'AI assistant (basic)', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom integrations', included: false }
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with complex needs',
      price: {
        monthly: 29,
        annually: 24
      },
      features: [
        { name: 'Unlimited users', included: true },
        { name: 'Unlimited tasks', included: true },
        { name: 'Advanced bug tracking', included: true },
        { name: 'Chat with team members', included: true },
        { name: 'Advanced reporting', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Priority support', included: true },
        { name: 'AI assistant (advanced)', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom integrations', included: true }
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Choose the plan that fits your team's needs. All plans include a 14-day free trial.
            </p>
            
            {/* Billing toggle */}
            <div className="flex items-center justify-center mb-10">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={toggleBillingCycle}
                className="relative mx-4 inline-flex h-6 w-12 items-center rounded-full bg-blue-600"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annually' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'annually' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                Annually <span className="text-green-500 font-medium">Save 20%</span>
              </span>
            </div>
          </div>
        </section>
        
        {/* Pricing cards */}
        <section className="py-12 -mt-10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                    tier.popular ? 'ring-2 ring-blue-500 md:scale-105' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {tier.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      {tier.description}
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${tier.price[billingCycle]}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        {tier.price[billingCycle] === 0 ? 'forever' : `per user/${billingCycle === 'monthly' ? 'mo' : 'yr'}`}
                      </span>
                    </div>
                    
                    <button
                      className={`w-full py-3 rounded-md font-medium transition-colors ${
                        tier.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      {tier.cta}
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="px-6 py-3 flex items-start">
                          {feature.included ? (
                            <FaCheck className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          ) : (
                            <FaTimes className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Can I switch plans later?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, you'll receive credit toward your next billing cycle.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  How does the free trial work?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All paid plans include a 14-day free trial with full access to all features. No credit card is required during the trial period.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For Enterprise plans, we can also accommodate purchase orders and bank transfers.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Do you offer discounts for nonprofits or educational institutions?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, we offer special pricing for nonprofits, educational institutions, and open-source projects. Please contact our sales team for more information.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to streamline your workflow?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PricingPage; 