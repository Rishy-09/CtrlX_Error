import React from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { FaTasks, FaBug, FaUsers, FaComments, FaBell, FaChartBar, FaMobile, FaLock, FaSync, FaCogs } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Features = () => {
  const features = [
    {
      title: 'Task Management',
      icon: <FaTasks className="text-4xl text-primary mb-4" />,
      description: 'Create, assign, and track tasks with ease. Set priorities, deadlines, and categories to keep your team organized and focused on what matters most.'
    },
    {
      title: 'Bug Tracking',
      icon: <FaBug className="text-4xl text-primary mb-4" />,
      description: 'Log and track bugs with detailed reporting. Assign severity levels, attach screenshots, and monitor resolution progress all in one place.'
    },
    {
      title: 'Team Collaboration',
      icon: <FaUsers className="text-4xl text-primary mb-4" />,
      description: 'Bring your team together with shared workspaces, role-based permissions, and real-time updates on project progress.'
    },
    {
      title: 'Built-in Chat',
      icon: <FaComments className="text-4xl text-primary mb-4" />,
      description: 'Communicate effectively with team members through our integrated chat system. Create public or private channels for different topics or projects.'
    },
    {
      title: 'Customizable Reminders',
      icon: <FaBell className="text-4xl text-primary mb-4" />,
      description: 'Never miss a deadline with customizable reminders. Set up notifications based on due dates, priorities, or specific events.'
    },
    {
      title: 'Reporting & Analytics',
      icon: <FaChartBar className="text-4xl text-primary mb-4" />,
      description: 'Gain insights into your team\'s performance with comprehensive reports and dashboards. Track completion rates, time spent, and bottlenecks.'
    },
    {
      title: 'Mobile Friendly',
      icon: <FaMobile className="text-4xl text-primary mb-4" />,
      description: 'Access your tasks and projects from anywhere with our responsive design that works seamlessly across desktop and mobile devices.'
    },
    {
      title: 'Secure & Private',
      icon: <FaLock className="text-4xl text-primary mb-4" />,
      description: 'Keep your data safe with enterprise-grade security. Role-based access controls ensure sensitive information stays protected.'
    },
    {
      title: 'Real-time Updates',
      icon: <FaSync className="text-4xl text-primary mb-4" />,
      description: 'See changes as they happen with real-time updates. No need to refresh the page to get the latest status of your tasks and projects.'
    },
    {
      title: 'Customizable Workflows',
      icon: <FaCogs className="text-4xl text-primary mb-4" />,
      description: 'Adapt the system to your needs with customizable workflows. Create templates for recurring tasks and define your own project stages.'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for Effective Task Management</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Our comprehensive set of features helps teams stay organized, collaborate effectively, and deliver projects on time.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-100 dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 dark:text-white">Ready to streamline your workflow?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of teams that use our task management system to boost productivity and deliver results.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/signup" 
                className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md font-medium transition-colors duration-300"
              >
                Get Started for Free
              </Link>
              <Link 
                to="/pricing" 
                className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-6 rounded-md font-medium border border-gray-300 dark:border-gray-600 transition-colors duration-300"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Features; 