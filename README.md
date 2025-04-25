# Task Management System

A comprehensive full-stack application for managing tasks, projects, and team collaboration.

## Setup Instructions

### Setting up the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=8000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   MONGO_URI=mongodb://localhost:27017/taskmanagement
   CLIENT_URL=http://localhost:5173
   
   # Email configuration (Configure these to enable email sending)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=no-reply@taskmanagement.com
   
   # Admin configuration
   ADMIN_INVITE_TOKEN=secret_admin_token_change_this
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Setting up the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

## Troubleshooting Common Issues

### Email Configuration Issues

If you're experiencing 500 errors when using the forgot password functionality, it's likely due to missing email configuration:

1. Make sure you've set up the email environment variables in your `.env` file:
   - `EMAIL_SERVICE`: The email service provider (e.g., 'gmail')
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASSWORD`: Your email password or app password
   - `EMAIL_FROM`: The sender email address

2. For Gmail, you'll need to:
   - Enable 2-factor authentication on your Google account
   - Generate an App Password (not your regular password)
   - Use this App Password in your `.env` file
   - [Learn more about App Passwords](https://support.google.com/accounts/answer/185833)

3. If you don't want to configure email sending, the system will fallback to console-only mode in development environments:
   - Password reset tokens will be generated and saved
   - Email content will be logged to the server console
   - In development mode, reset tokens and URLs will be displayed in the UI

### Image Loading Issues

If you're seeing `ERR_NAME_NOT_RESOLVED` errors for placeholder images:

1. The application uses UI Avatars as a fallback for profile images
2. Make sure your application has internet connectivity
3. If you're behind a corporate firewall, you may need to add ui-avatars.com to your allowed domains

### 500 Server Errors

If you're experiencing generic 500 server errors:

1. Check the server console for detailed error messages
2. Verify your MongoDB connection is working
3. Ensure all required environment variables are properly set

## Features

- User authentication and authorization
- Task management with status tracking
- Team collaboration features
- Real-time chat messaging
- Notifications system
- Dark/light theme support
- Profile management
- And much more! 