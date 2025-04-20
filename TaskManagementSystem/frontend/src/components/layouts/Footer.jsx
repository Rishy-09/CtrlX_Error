import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Roadmap', path: '/roadmap' },
        { name: 'Changelog', path: '/changelog' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', path: '/docs' },
        { name: 'Tutorials', path: '/tutorials' },
        { name: 'Blog', path: '/blog' },
        { name: 'Support', path: '/support' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Contact', path: '/contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Data Storage Policy', path: '/data-storage' }
      ]
    }
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Task Management System</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Streamline your workflow with our comprehensive task management solution. 
              Designed for teams of all sizes to track, manage, and collaborate effectively.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <FaGithub size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <FaTwitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <FaLinkedin size={20} />
              </a>
              <a href="mailto:info@taskmanagementsystem.com" aria-label="Email" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <FaEnvelope size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.path} 
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Task Management System. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link to="/terms" className="hover:text-primary dark:hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary dark:hover:text-primary transition-colors">Privacy</Link>
            <Link to="/data-storage" className="hover:text-primary dark:hover:text-primary transition-colors">Data Storage</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 