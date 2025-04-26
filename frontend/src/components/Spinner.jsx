import React from 'react';

const Spinner = ({ size = 'md' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin`}></div>
  );
};

export default Spinner; 