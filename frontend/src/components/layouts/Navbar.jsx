import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiChevronLeft, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { UserContext } from '../../context/userContext';

const Navbar = () => {
  const { user, clearUser } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're not on the dashboard/home page to show back button
  const showBackButton = !(
    location.pathname === '/admin/dashboard' || 
    location.pathname === '/user/dashboard' ||
    location.pathname === '/landing' ||
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup'
  );
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  // Determine base path by user role
  const getBasePath = () => {
    if (!user) return '/';
    return user.role === 'admin' ? '/admin' : '/user';
  };

  // Get correct profile and settings paths based on user role
  const getProfilePath = () => {
    return `${getBasePath()}/profile`;
  };

  const getSettingsPath = () => {
    return `${getBasePath()}/settings`;
  };
  
  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate avatar URL for fallback
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
  };
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Back button */}
            {showBackButton && (
              <button 
                onClick={goBack}
                className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Go back"
              >
                <FiChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
            
            {/* Logo */}
            <Link to={getBasePath() + '/dashboard'} className="flex items-center">
              <span className="font-bold text-xl text-blue-600 dark:text-blue-400">CtrlX-Error</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {user ? (
                <>
                  <Link
                    to={getBasePath() + '/dashboard'}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={getBasePath() + '/tasks'}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Bugs
                  </Link>
                  <Link
                    to={getBasePath() + '/chat'}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Chat
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    About
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center">
            {/* User Profile Menu */}
            {user ? (
              <div className="relative ml-3" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {user.profileImageURL ? (
                      <img
                        src={user.profileImageURL}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          // Replace with initials avatar
                          e.target.style.display = 'none';
                          e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                          const initialsSpan = document.createElement('span');
                          initialsSpan.className = 'text-sm font-medium';
                          initialsSpan.textContent = getInitials(user.name);
                          e.target.parentNode.appendChild(initialsSpan);
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium">{getInitials(user.name)}</span>
                    )}
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 ">
                    <div className="py-1 ">
                      <div className="px-4 py-3 border-b dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user.email}>{user.email}</p>
                      </div>
                      <Link
                        to={getProfilePath()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiUser className="mr-2" /> Profile
                      </Link>
                      <Link
                        to={getSettingsPath()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiSettings className="mr-2" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiLogOut className="mr-2" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="ml-2 md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 pb-3 pt-2">
          <div className="space-y-1 px-2">
            {user ? (
              <>
                <Link
                  to={getBasePath() + '/dashboard'}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to={getBasePath() + '/tasks'}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Bugs
                </Link>
                <Link
                  to={getBasePath() + '/chat'}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Chat
                </Link>
                <Link
                  to={getSettingsPath()}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  About
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 px-4 py-2 m-2 rounded-md hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;