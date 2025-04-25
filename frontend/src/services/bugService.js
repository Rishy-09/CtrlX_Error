import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiPaths';
import { handleApiError } from '../utils/errorHandler';

// Get dashboard data for admin
export const getDashboardData = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.BUGS.DASHBOARD_DATA);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get dashboard data for regular user
export const getUserDashboardData = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.BUGS.USER_DASHBOARD_DATA);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all bugs with optional filters
export const getAllBugs = async (filters = {}) => {
  try {
    const { status, priority, page, limit, search } = filters;
    let url = API_ENDPOINTS.BUGS.GET_ALL;
    
    const queryParams = [];
    if (status) queryParams.push(`status=${encodeURIComponent(status)}`);
    if (priority) queryParams.push(`priority=${encodeURIComponent(priority)}`);
    if (page) queryParams.push(`page=${page}`);
    if (limit) queryParams.push(`limit=${limit}`);
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get bug by ID
export const getBugById = async (bugId) => {
  try {
    const response = await axios.get(API_ENDPOINTS.BUGS.GET_BY_ID.replace(':id', bugId));
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new bug
export const createBug = async (bugData) => {
  try {
    // Handle file uploads
    let formData = null;
    if (bugData.attachments && bugData.attachments.length > 0) {
      formData = new FormData();
      
      // Add all non-file fields to the form data
      Object.keys(bugData).forEach(key => {
        if (key !== 'attachments') {
          // Handle objects and arrays
          if (typeof bugData[key] === 'object' && bugData[key] !== null) {
            formData.append(key, JSON.stringify(bugData[key]));
          } else {
            formData.append(key, bugData[key]);
          }
        }
      });
      
      // Add files
      bugData.attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await axios.post(API_ENDPOINTS.BUGS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // No files, use regular JSON request
      const response = await axios.post(API_ENDPOINTS.BUGS.CREATE, bugData);
      return response.data;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update a bug
export const updateBug = async (bugId, bugData) => {
  try {
    // Handle file uploads
    let formData = null;
    if (bugData.attachments && bugData.attachments.length > 0) {
      formData = new FormData();
      
      // Add all non-file fields to the form data
      Object.keys(bugData).forEach(key => {
        if (key !== 'attachments') {
          // Handle objects and arrays
          if (typeof bugData[key] === 'object' && bugData[key] !== null) {
            formData.append(key, JSON.stringify(bugData[key]));
          } else {
            formData.append(key, bugData[key]);
          }
        }
      });
      
      // Add files
      bugData.attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await axios.put(API_ENDPOINTS.BUGS.UPDATE.replace(':id', bugId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // No files, use regular JSON request
      const response = await axios.put(API_ENDPOINTS.BUGS.UPDATE.replace(':id', bugId), bugData);
      return response.data;
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a bug
export const deleteBug = async (bugId) => {
  try {
    const response = await axios.delete(API_ENDPOINTS.BUGS.DELETE.replace(':id', bugId));
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update bug status
export const updateBugStatus = async (bugId, status) => {
  try {
    const response = await axios.patch(
      API_ENDPOINTS.BUGS.UPDATE_STATUS.replace(':id', bugId), 
      { status }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update bug checklist
export const updateBugChecklist = async (bugId, todoChecklist) => {
  try {
    const response = await axios.patch(
      API_ENDPOINTS.BUGS.UPDATE_CHECKLIST.replace(':id', bugId), 
      { todoChecklist }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Assign bug to user
export const assignBug = async (bugId, userId) => {
  try {
    const response = await axios.patch(
      API_ENDPOINTS.BUGS.ASSIGN.replace(':id', bugId), 
      { assignedTo: userId }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get bug attachments
export const getBugAttachments = async (bugId) => {
  try {
    const response = await axios.get(API_ENDPOINTS.BUGS.GET_ATTACHMENTS.replace(':id', bugId));
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}; 