export const BASE_URL = "http://localhost:8000";

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
        UPDATE_BUG_CHECKLIST: (bugId) => `/api/bugs/${bugId}/checklist`, // Update bug checklist
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