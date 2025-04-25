import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';

// Helper function to generate avatar URL
const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
};

// Helper function to get initials
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  showName = false,
  namePosition = 'right',
  onClick = null
}) => {
  const [imageError, setImageError] = useState(false);
  
  if (!user) return null;

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  // Container classes for name positioning
  const containerClasses = showName ? `flex items-center ${namePosition === 'right' ? 'flex-row' : 'flex-col'}` : '';
  
  // Name spacing classes
  const nameSpacingClasses = namePosition === 'right' ? 'ml-2' : 'mt-1';
  
  // Avatar click handler
  const handleClick = onClick ? onClick : () => {};

  // Determine what to render for avatar content
  const renderAvatarContent = () => {
    // If user has profile image and no error loading it
    if (user.profileImageURL && !imageError) {
      return (
        <img 
          src={user.profileImageURL} 
          alt={user.name || 'User'} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      );
    }
    
    // If user has a name, show initials
    if (user.name) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium">
          {getInitials(user.name)}
        </div>
      );
    }
    
    // Fallback to generic user icon
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <FaUser />
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      <div 
        className={`relative rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {renderAvatarContent()}
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