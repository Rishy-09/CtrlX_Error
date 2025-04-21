import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { UserContext } from '../../context/userContext';
import ThemeToggle from './ThemeToggle';
import UserAvatar from '../UserAvatar';
import MobileMenu from './MobileMenu';

const Navigation = () => {
  const { user, logout } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  // Go forward to next page
  const goForward = () => {
    navigate(1);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Navigation Arrows */}
            <div className="flex items-center space-x-2 mr-4">
              <button 
                onClick={goBack}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                aria-label="Go back"
              >
                <FaArrowLeft />
              </button>
              <button 
                onClick={goForward}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                aria-label="Go forward"
              >
                <FaArrowRight />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard') : '/'} className="text-xl font-bold text-primary">
                TaskManager
              </Link>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!user ? (
              <div className="flex items-center space-x-4">
                <Link to="/pricing" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium">
                  Pricing
                </Link>
                <Link to="/login" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link to="/signup" className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 py-2 text-sm font-medium">
                  Sign Up
                </Link>
                <ThemeToggle />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' ? (
                  <>
                    <Link to="/admin/dashboard" className={`px-3 py-2 text-sm font-medium ${location.pathname.includes('/admin/dashboard') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}>
                      Dashboard
                    </Link>
                    <Link to="/admin/tasks" className={`px-3 py-2 text-sm font-medium ${location.pathname.includes('/admin/tasks') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}>
                      Tasks
                    </Link>
                    <Link to="/admin/users" className={`px-3 py-2 text-sm font-medium ${location.pathname.includes('/admin/users') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}>
                      Users
                    </Link>
                    <Link to="/admin/chat" className={`px-3 py-2 text-sm font-medium ${location.pathname.includes('/admin/chat') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}>
                      Chat
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/user/dashboard" className={`px-3 py-2 text-sm font-medium ${location.pathname.includes('/user/dashboard') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}>
                      Dashboard
                    </Link>
                    <Link to="/user/tasks" className={`px-3 py-2 text-sm font-medium ${location.pathname.includes('/user/tasks') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}>
                      My Tasks
                    </Link>
                    <Link to="/user/chat" className={`px-3 py-2 text-sm font-medium ${location.pathname.includes('/user/chat') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}>
                      Chat
                    </Link>
                  </>
                )}
                
                <div className="relative ml-3 flex items-center space-x-4">
                  <ThemeToggle />
                  
                  <div className="relative">
                    <div className="flex items-center">
                      <UserAvatar 
                        user={user} 
                        size="sm"
                        onClick={() => {
                          const settingsRoute = user.role === 'admin' ? '/admin/settings' : '/user/settings';
                          navigate(settingsRoute);
                        }} 
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ml-2"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <MobileMenu user={user} onLogout={handleLogout} onClose={toggleMenu} />
      )}
    </nav>
  );
};

export default Navigation; 