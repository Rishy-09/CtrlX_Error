import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateMongoIdParam } from '../utils/routeValidators';

/**
 * Wrapper component that validates MongoDB IDs in URL parameters
 * If validation fails, redirects to a fallback path
 * 
 * @param {Object} props - Component props
 * @param {string} props.paramName - URL parameter name to validate (e.g., 'chatId')
 * @param {string} props.fallbackPath - Path to redirect to if ID is invalid
 * @param {boolean} props.showToast - Whether to show a toast notification (default: true)
 * @param {string} props.toastMessage - Custom toast message (default: 'Invalid ID format')
 * @param {Component} props.component - The component to render if validation passes
 * @returns {JSX.Element | null} - The component if ID is valid, otherwise redirects
 */
const MongoIdValidator = ({ 
  paramName, 
  fallbackPath, 
  showToast = true, 
  toastMessage = 'Invalid ID format',
  children
}) => {
  const params = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Validate the MongoDB ID parameter
    validateMongoIdParam({
      paramName,
      params,
      navigate,
      fallbackPath,
      showToast,
      toastMessage
    });
  }, [params, paramName, navigate, fallbackPath, showToast, toastMessage]);
  
  // If there's no ID in the URL (which is valid in our context), or it's a valid ID, render the children
  return (params[paramName] && !validateMongoIdParam({
    paramName, 
    params, 
    navigate,
    // Don't navigate again in the render phase, we already do that in useEffect
    fallbackPath: null,
    showToast: false
  })) ? null : children;
};

export default MongoIdValidator; 