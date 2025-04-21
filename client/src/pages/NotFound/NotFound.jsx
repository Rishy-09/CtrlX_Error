import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const getHomeUrl = () => {
    if (!user) return '/';
    return user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <FaExclamationTriangle className="text-yellow-500 text-6xl" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Page Not Found</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
          
          <Link
            to={getHomeUrl()}
            className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 