export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: (userId) => `/api/users/${userId}`, // Corrected to function
  },

  USERS: {
    GET_ALL_USERS: "/api/users",
    GET_DEVELOPERS: "/api/users/developers",
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
  },

  BUGS: {
    GET_ALL_BUGS: "/api/bugs",
    GET_BUG_BY_ID: (bugId) => `/api/bugs/${bugId}`,
    GET_USER_BUGS: (userId) => `/api/bugs/user/${userId}`,
    GET_ALL_VIEWABLE_BUGS: "/api/bugs/all-viewable",
    GET_ASSIGNED_BUGS: "/api/bugs/assigned",
    CREATE_BUG: "/api/bugs",
    UPDATE_BUG: (bugId) => `/api/bugs/${bugId}`,
    DELETE_BUG: (bugId) => `/api/bugs/${bugId}`,
    UPDATE_BUG_STATUS: (bugId) => `/api/bugs/${bugId}/status`,
    UPDATE_CHECKLIST: (bugId) => `/api/bugs/${bugId}/checklist`,
  },

  DASHBOARD: {
    ADMIN: "/api/bugs/admin-dashboard",
    TESTER: "/api/bugs/tester-dashboard",
    DEVELOPER: "/api/bugs/developer-dashboard",
  },

  REPORTS: {
    EXPORT_BUGS: "/api/reports/export/bugs",
    EXPORT_USERS: "/api/reports/export/users",
  },

  IMAGE: {
    UPLOAD: "/api/auth/upload-image",
  },
};
