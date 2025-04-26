/**
 * Middleware to normalize route parameter names
 * This solves the mismatch between route param names and controller expectations
 * 
 * @param {Object} options - Options for parameter normalization
 * @param {Object} options.params - Mapping of current param names to desired param names
 * @returns {Function} - Express middleware function
 */
export const normalizeParams = (options) => {
  const { params = {} } = options || {};
  
  return (req, res, next) => {
    // For each param mapping, check if original exists and copy to new name
    Object.entries(params).forEach(([originalParam, newParam]) => {
      if (req.params[originalParam] !== undefined && req.params[newParam] === undefined) {
        req.params[newParam] = req.params[originalParam];
      }
    });
    
    next();
  };
};

/**
 * Specific middleware to normalize chat ID parameters
 * This normalizes :id to :chatId for chat-related routes
 */
export const normalizeChatIdParam = (req, res, next) => {
  // If route has 'id' parameter but no 'chatId', copy it over
  if (req.params.id !== undefined && req.params.chatId === undefined) {
    req.params.chatId = req.params.id;
  }
  
  next();
}; 