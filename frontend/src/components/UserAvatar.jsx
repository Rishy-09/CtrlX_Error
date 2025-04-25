import React from 'react';
import { FaUser } from 'react-icons/fa';

// Default profile image to use when user doesn't have a profile picture
const DEFAULT_PROFILE_IMAGE = "https://res.cloudinary.com/dykjpvgga/image/upload/v1674645487/a9ljktjl3o8f2fbwm2kt.jpg";

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  showName = false,
  namePosition = 'right',
  onClick = null
}) => {
  if (!user) return null;

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
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

  // Use default image if user has no profile image
  const profileImage = user.profileImageURL || DEFAULT_PROFILE_IMAGE;

  // Container classes for name positioning
  const containerClasses = showName ? `flex items-center ${namePosition === 'right' ? 'flex-row' : 'flex-col'}` : '';
  
  // Name spacing classes
  const nameSpacingClasses = namePosition === 'right' ? 'ml-2' : 'mt-1';
  
  // Avatar click handler
  const handleClick = onClick ? onClick : () => {};

  return (
    <div className={containerClasses}>
      <div 
        className={`relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {profileImage ? (
          <img 
            src={profileImage} 
            alt={user.name || 'User'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            {user.name ? getInitials(user.name) : <FaUser />}
          </div>
        )}
      </div>
      
      {showName && user.name && (
        <span className={`text-sm font-medium dark:text-white ${nameSpacingClasses}`}>
          {user.name}
        </span>
      )}
    </div>
  );
};

export default UserAvatar; 