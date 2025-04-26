import { toast } from 'react-hot-toast';

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if the ID is valid
 */
export const isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Route validator component for MongoDB IDs
 * Redirects to fallbackPath if the ID is invalid
 * @param {Object} props - Component props
 * @param {string} props.paramName - URL parameter name to validate (e.g., 'chatId')
 * @param {Object} props.params - useParams() result
 * @param {function} props.navigate - useNavigate() function
 * @param {string} props.fallbackPath - Path to redirect to if ID is invalid
 * @param {boolean} props.showToast - Whether to show a toast notification
 * @param {string} props.toastMessage - Custom toast message
 * @returns {boolean} - True if the ID is valid, false if invalid
 */
export const validateMongoIdParam = ({ 
  paramName, 
  params, 
  navigate, 
  fallbackPath, 
  showToast = true,
  toastMessage = 'Invalid ID format'
}) => {
  const id = params[paramName];
  
  // If no ID provided, consider it valid (might be an optional parameter)
  if (!id) return true;
  
  const valid = isValidMongoId(id);
  
  if (!valid) {
    console.error(`Invalid ${paramName} MongoDB format:`, id);
    
    if (showToast) {
      toast.error(toastMessage);
    }
    
    if (fallbackPath) {
      // Use replace: true to avoid adding the invalid URL to history
      navigate(fallbackPath, { replace: true });
    }
    
    return false;
  }
  
  return true;
}; 