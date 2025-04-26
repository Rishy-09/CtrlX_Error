export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; // Base URL for API requests

// utils/apiPaths.js
export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", // Register a new user (Admin or member)
        LOGIN: "/api/auth/login", // Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile", // Get logged-in user details
        UPDATE_PROFILE: "/api/auth/profile",
        FORGOT_PASSWORD: "/api/auth/forgot-password",
        RESET_PASSWORD: "/api/auth/reset-password",
        VERIFY_EMAIL: "/api/auth/verify-email",
        RESEND_VERIFICATION: "/api/auth/resend-verification"
    },

    USERS: {
        GET_ALL_USERS: "/api/users", // Get all users (Admin only)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user by ID
        CREATE_USER: "/api/users", // Create a new user (Admin only)
        UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user details
        DELETE_USER: (userId) => `/api/users/${userId}`, // Delete a user
    },

    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get Dashboard Data
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get User Dashboard Data
        GET_ALL_TASKS: "/api/tasks", // Get all tasks (Admin: all, User: only assigned)
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID
        CREATE_TASK: "/api/tasks", // Create a new task (Admin only)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task details
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete a task (Admin only)

        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update task status
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update task todo
        
        // Task Comments
        ADD_COMMENT: (taskId) => `/api/tasks/${taskId}/comments`, // Add comment to a task
        GET_COMMENTS: (taskId) => `/api/tasks/${taskId}/comments`, // Get task comments
        
        // Task Time Tracking
        START_TIME_TRACKING: (taskId) => `/api/tasks/${taskId}/time/start`, // Start tracking time
        STOP_TIME_TRACKING: (taskId) => `/api/tasks/${taskId}/time/stop`, // Stop tracking time
        GET_TIME_ENTRIES: (taskId) => `/api/tasks/${taskId}/time`, // Get time entries
        
        // Task Dependencies
        ADD_DEPENDENCY: (taskId) => `/api/tasks/${taskId}/dependencies`, // Add dependency
        REMOVE_DEPENDENCY: (taskId, dependencyId) => `/api/tasks/${taskId}/dependencies/${dependencyId}`, // Remove dependency
        GET_DEPENDENCIES: (taskId) => `/api/tasks/${taskId}/dependencies`, // Get dependencies
    },

    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks", // Download all tasks as an Excel file 
        EXPORT_USERS: "/api/reports/export/users", // Download user-task report
    },

    IMAGE: {
        UPLOAD: "/api/auth/upload-image",
    },

    REMINDERS: {
        CREATE_REMINDER: "/api/reminders",
        GET_USER_REMINDERS: "/api/reminders",
        MARK_REMINDER_READ: (reminderId) => `/api/reminders/${reminderId}/read`,
        DELETE_REMINDER: (reminderId) => `/api/reminders/${reminderId}`,
    },

    CHATS: {
        GET_ALL_CHATS: "/api/chats", // Get all chats for the logged-in user
        GET_CHAT_BY_ID: (chatId) => `/api/chats/${chatId}`, // Get a specific chat
        CREATE_CHAT: "/api/chats", // Create a new chat
        UPDATE_CHAT: (chatId) => `/api/chats/${chatId}`, // Update chat details
        DELETE_CHAT: (chatId) => `/api/chats/${chatId}`, // Delete a chat
        UPDATE_PARTICIPANTS: (chatId) => `/api/chats/${chatId}/participants`, // Add/remove participants
        
        // Chat Messages
        GET_MESSAGES: (chatId) => `/api/chats/${chatId}/messages`, // Get messages for a chat
        SEND_MESSAGE: (chatId) => `/api/chats/${chatId}/messages`, // Send a message in a chat
        DELETE_MESSAGE: (chatId, messageId) => `/api/chats/${chatId}/messages/${messageId}`, // Delete a message
        ADD_REACTION: (chatId, messageId) => `/api/chats/${chatId}/messages/${messageId}/reactions`, // Add reaction to a message
    },

    BUGS: {
        GET_DASHBOARD_DATA: "/api/bugs/dashboard-data", // Get Dashboard Data
        GET_USER_DASHBOARD_DATA: "/api/bugs/dashboard/user", // Get User Dashboard Data
        GET_ALL_BUGS: "/api/bugs", // Get all bugs
        GET_BUG_BY_ID: (bugId) => `/api/bugs/${bugId}`, // Get bug by ID
        CREATE_BUG: "/api/bugs", // Create a new bug
        UPDATE_BUG: (bugId) => `/api/bugs/${bugId}`, // Update bug details
        DELETE_BUG: (bugId) => `/api/bugs/${bugId}`, // Delete a bug
        UPDATE_BUG_STATUS: (bugId) => `/api/bugs/${bugId}/status`, // Update bug status
        UPDATE_BUG_CHECKLIST: (bugId) => `/api/bugs/${bugId}/todo`, // Update bug checklist
        ASSIGN_BUG: (bugId) => `/api/bugs/${bugId}/assign`, // Assign bug to users
        GET_BUG_ATTACHMENTS: (bugId) => `/api/bugs/${bugId}/attachments`, // Get bug attachments
    },

    COMMENTS: {
        ADD_COMMENT: "/api/comments", // Add a comment
        GET_COMMENTS: (bugId) => `/api/comments/${bugId}`, // Get comments for a bug
        UPDATE_COMMENT: (commentId) => `/api/comments/${commentId}`, // Update a comment
        DELETE_COMMENT: (commentId) => `/api/comments/${commentId}`, // Delete a comment
        GET_COMMENT_REPLIES: (commentId) => `/api/comments/${commentId}/replies`, // Get replies to a comment
    },

    ATTACHMENTS: {
        DOWNLOAD: (attachmentId) => `/api/attachments/download/${attachmentId}`, // Download an attachment
        DELETE: (attachmentId) => `/api/attachments/${attachmentId}`, // Delete an attachment
    },

    EMAIL: {
        SEND_NOTIFICATION: "/api/email/send-notification",
        SEND_INVITE: "/api/email/send-invite",
        SUBSCRIBE_NEWSLETTER: "/api/email/subscribe"
    },
};

// API endpoints for direct use in services
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: `${BASE_URL}${API_PATHS.AUTH.REGISTER}`,
        LOGIN: `${BASE_URL}${API_PATHS.AUTH.LOGIN}`,
        GET_PROFILE: `${BASE_URL}${API_PATHS.AUTH.GET_PROFILE}`,
        UPDATE_PROFILE: `${BASE_URL}${API_PATHS.AUTH.UPDATE_PROFILE}`,
        FORGOT_PASSWORD: `${BASE_URL}${API_PATHS.AUTH.FORGOT_PASSWORD}`,
        RESET_PASSWORD: `${BASE_URL}${API_PATHS.AUTH.RESET_PASSWORD}`,
        VERIFY_EMAIL: `${BASE_URL}${API_PATHS.AUTH.VERIFY_EMAIL}`,
        RESEND_VERIFICATION: `${BASE_URL}${API_PATHS.AUTH.RESEND_VERIFICATION}`
    },

    USERS: {
        GET_ALL_USERS: `${BASE_URL}${API_PATHS.USERS.GET_ALL_USERS}`,
        GET_USER_BY_ID: `${BASE_URL}/api/users/:id`,
        CREATE_USER: `${BASE_URL}${API_PATHS.USERS.CREATE_USER}`,
        UPDATE_USER: `${BASE_URL}/api/users/:id`,
        DELETE_USER: `${BASE_URL}/api/users/:id`
    },

    TASKS: {
        GET_DASHBOARD_DATA: `${BASE_URL}${API_PATHS.TASKS.GET_DASHBOARD_DATA}`,
        GET_USER_DASHBOARD_DATA: `${BASE_URL}${API_PATHS.TASKS.GET_USER_DASHBOARD_DATA}`,
        GET_ALL_TASKS: `${BASE_URL}${API_PATHS.TASKS.GET_ALL_TASKS}`,
        GET_TASK_BY_ID: `${BASE_URL}/api/tasks/:id`,
        CREATE_TASK: `${BASE_URL}${API_PATHS.TASKS.CREATE_TASK}`,
        UPDATE_TASK: `${BASE_URL}/api/tasks/:id`,
        DELETE_TASK: `${BASE_URL}/api/tasks/:id`,
        UPDATE_TASK_STATUS: `${BASE_URL}/api/tasks/:id/status`,
        UPDATE_TODO_CHECKLIST: `${BASE_URL}/api/tasks/:id/todo`,
        ADD_COMMENT: `${BASE_URL}/api/tasks/:id/comments`,
        GET_COMMENTS: `${BASE_URL}/api/tasks/:id/comments`,
        START_TIME_TRACKING: `${BASE_URL}/api/tasks/:id/time/start`,
        STOP_TIME_TRACKING: `${BASE_URL}/api/tasks/:id/time/stop`,
        GET_TIME_ENTRIES: `${BASE_URL}/api/tasks/:id/time`,
        ADD_DEPENDENCY: `${BASE_URL}/api/tasks/:id/dependencies`,
        REMOVE_DEPENDENCY: `${BASE_URL}/api/tasks/:id/dependencies/:dependencyId`,
        GET_DEPENDENCIES: `${BASE_URL}/api/tasks/:id/dependencies`
    },

    REPORTS: {
        EXPORT_TASKS: `${BASE_URL}${API_PATHS.REPORTS.EXPORT_TASKS}`,
        EXPORT_USERS: `${BASE_URL}${API_PATHS.REPORTS.EXPORT_USERS}`
    },

    IMAGE: {
        UPLOAD: `${BASE_URL}${API_PATHS.IMAGE.UPLOAD}`
    },

    REMINDERS: {
        CREATE_REMINDER: `${BASE_URL}${API_PATHS.REMINDERS.CREATE_REMINDER}`,
        GET_USER_REMINDERS: `${BASE_URL}${API_PATHS.REMINDERS.GET_USER_REMINDERS}`,
        MARK_REMINDER_READ: `${BASE_URL}/api/reminders/:id/read`,
        DELETE_REMINDER: `${BASE_URL}/api/reminders/:id`
    },

    CHATS: {
        GET_ALL_CHATS: `${BASE_URL}${API_PATHS.CHATS.GET_ALL_CHATS}`,
        GET_CHAT_BY_ID: `${BASE_URL}/api/chats/:id`,
        CREATE_CHAT: `${BASE_URL}${API_PATHS.CHATS.CREATE_CHAT}`,
        UPDATE_CHAT: `${BASE_URL}/api/chats/:id`,
        DELETE_CHAT: `${BASE_URL}/api/chats/:id`,
        UPDATE_PARTICIPANTS: `${BASE_URL}/api/chats/:id/participants`,
        GET_MESSAGES: `${BASE_URL}/api/chats/:id/messages`,
        SEND_MESSAGE: `${BASE_URL}/api/chats/:id/messages`,
        DELETE_MESSAGE: `${BASE_URL}/api/chats/:id/messages/:messageId`,
        ADD_REACTION: `${BASE_URL}/api/chats/:id/messages/:messageId/reactions`
    },

    BUGS: {
        DASHBOARD_DATA: `${BASE_URL}${API_PATHS.BUGS.GET_DASHBOARD_DATA}`,
        USER_DASHBOARD_DATA: `${BASE_URL}${API_PATHS.BUGS.GET_USER_DASHBOARD_DATA}`,
        GET_ALL: `${BASE_URL}${API_PATHS.BUGS.GET_ALL_BUGS}`,
        GET_BY_ID: `${BASE_URL}/api/bugs/:id`,
        CREATE: `${BASE_URL}${API_PATHS.BUGS.CREATE_BUG}`,
        UPDATE: `${BASE_URL}/api/bugs/:id`,
        DELETE: `${BASE_URL}/api/bugs/:id`,
        UPDATE_STATUS: `${BASE_URL}/api/bugs/:id/status`,
        UPDATE_CHECKLIST: `${BASE_URL}/api/bugs/:id/todo`,
        ASSIGN: `${BASE_URL}/api/bugs/:id/assign`,
        GET_ATTACHMENTS: `${BASE_URL}/api/bugs/:id/attachments`
    },

    COMMENTS: {
        ADD_COMMENT: `${BASE_URL}${API_PATHS.COMMENTS.ADD_COMMENT}`,
        GET_COMMENTS: `${BASE_URL}/api/comments/:id`,
        UPDATE_COMMENT: `${BASE_URL}/api/comments/:id`,
        DELETE_COMMENT: `${BASE_URL}/api/comments/:id`,
        GET_COMMENT_REPLIES: `${BASE_URL}/api/comments/:id/replies`
    },

    ATTACHMENTS: {
        DOWNLOAD: `${BASE_URL}/api/attachments/download/:id`,
        DELETE: `${BASE_URL}/api/attachments/:id`
    },

    EMAIL: {
        SEND_NOTIFICATION: `${BASE_URL}${API_PATHS.EMAIL.SEND_NOTIFICATION}`,
        SEND_INVITE: `${BASE_URL}${API_PATHS.EMAIL.SEND_INVITE}`,
        SUBSCRIBE_NEWSLETTER: `${BASE_URL}${API_PATHS.EMAIL.SUBSCRIBE_NEWSLETTER}`
    }
};