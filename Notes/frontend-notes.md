# Frontend Documentation

## Project Overview
The frontend is built using React with Vite as the build tool. It's a modern single-page application (SPA) that implements a bug tracking system with different user roles (Admin, Tester, and Developer). The application follows a component-based architecture with a focus on reusability, maintainability, and user experience.

## Tech Stack
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.2.0
- **Styling**: TailwindCSS 4.1.3
- **Routing**: React Router DOM 7.4.1
- **HTTP Client**: Axios 1.8.4
- **Date Handling**: date-fns 3.6.0, moment 2.30.1
- **UI Components**: 
  - react-hot-toast for notifications
  - react-icons for icons
  - recharts for data visualization
- **Development Tools**:
  - ESLint 9.21.0 for code linting
  - TypeScript support (@types/react, @types/react-dom)

## Project Structure
```
frontend/
├── src/
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── Admin/      # Admin-specific pages
│   │   ├── Tester/     # Tester-specific pages
│   │   ├── Developer/  # Developer-specific pages
│   │   └── Auth/       # Authentication pages
│   ├── routes/         # Route definitions and guards
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Public static files
├── vite.config.js      # Vite configuration
└── package.json        # Project dependencies and scripts
```

## Component Architecture

### Core Components

#### 1. Layout Components (`/components/layouts/`)
- **DashboardLayout**: Base layout for all dashboard pages
  - Implements responsive sidebar navigation
  - Handles user role-based menu rendering
  - Manages mobile responsiveness
- **AuthLayout**: Layout for authentication pages
  - Provides consistent styling for login/signup forms
  - Handles authentication state management

#### 2. UI Components

##### Input Components (`/components/Inputs/`)
- **FormInput**: Reusable form input component
  - Handles validation states
  - Supports different input types
  - Implements error messaging
- **SelectInput**: Custom select component
  - Supports single and multi-select
  - Implements search functionality
  - Handles custom styling

##### Card Components (`/components/Cards/`)
- **BugCard**: Displays bug information in card format
  - Shows bug status, priority, and severity
  - Implements hover effects
  - Handles click events for navigation
- **UserCard**: Displays user information
  - Shows user role and status
  - Implements action buttons
  - Handles user management functions

##### Table Components
- **BugListTable** (`BugListTable.jsx`)
  - Implements responsive table for bug listing
  - Features:
    - Dynamic status badges with color coding
    - Priority and severity indicators
    - Sortable columns
    - Row click handling
    - Responsive design (hides less important columns on mobile)
  - Props:
    - `bugs`: Array of bug objects
    - `onRowClick`: Callback for row click events
  - Status Management:
    - Open: Red badge
    - In Progress: Yellow badge
    - Closed: Green badge
  - Priority Levels:
    - High: Red badge
    - Medium: Orange badge
    - Low: Green badge
  - Severity Levels:
    - Critical: Red badge
    - Major: Orange badge
    - Minor: Blue badge

##### Modal Components
- **Modal** (`Modal.jsx`)
  - Reusable modal component
  - Features:
    - Backdrop click handling
    - Custom header and footer
    - Responsive design
    - Animation support
- **DeleteAlert** (`DeleteAlert.jsx`)
  - Confirmation modal for delete operations
  - Implements warning messages
  - Handles confirmation callbacks

##### Progress Components
- **Progress** (`Progress.jsx`)
  - Visual progress indicator
  - Supports different states (loading, success, error)
  - Implements animation

##### Chat Components (`/components/chat/`)
- **ChatWindow**: Main chat interface
  - Real-time message updates
  - User presence indicators
  - Message history
- **MessageInput**: Chat input component
  - Message composition
  - File attachment support
  - Emoji picker integration

##### Chart Components (`/components/Charts/`)
- **BugStatusChart**: Visualizes bug status distribution
- **PriorityChart**: Shows bug priority distribution
- **TimelineChart**: Displays bug resolution timeline

### Context Management

#### 1. User Context (`/context/userContext.jsx`)
- **Purpose**: Manages global user state and authentication
- **Key Features**:
  - User authentication state
  - Role-based access control
  - Token management
  - Loading state handling
- **Exported Hooks**:
  - `useUserContext`: Main hook for user context
  - `useAuth`: Alias for chat system compatibility
- **State Management**:
  - `user`: Current user object
  - `loading`: Authentication loading state
  - `token`: JWT token management
- **Methods**:
  - `updateUser`: Updates user state and token
  - `clearUser`: Handles user logout
- **Authentication Flow**:
  1. Checks for existing token on mount
  2. Fetches user profile if token exists
  3. Updates global state accordingly
  4. Handles authentication errors

#### 2. Chat Context (`/context/ChatContext.jsx`)
- **Purpose**: Manages real-time chat functionality
- **Features**:
  - Message state management
  - Real-time updates
  - User presence tracking
  - Chat history management

### Page Components

#### 1. Authentication Pages (`/pages/Auth/`)
- **Login** (`Login.jsx`)
  - Form validation
  - Error handling
  - Remember me functionality
  - Password reset option
- **SignUp** (`Signup.jsx`)
  - User registration form
  - Role selection
  - Email verification
  - Password strength validation

#### 2. Admin Pages (`/pages/Admin/`)
- **AdminDashboard** (`AdminDashboard.jsx`)
  - Overview statistics
  - Recent activity
  - Quick actions
- **ManageBugs** (`ManageBugs.jsx`)
  - Bug listing and filtering
  - Bulk actions
  - Status management
- **ManageUsers** (`ManageUsers.jsx`)
  - User management
  - Role assignment
  - Account status control

#### 3. Tester Pages (`/pages/Tester/`)
- **TesterDashboard** (`TesterDashboard.jsx`)
  - Reported bugs overview
  - Bug status tracking
  - Quick report creation
- **ReportBug** (`CreateBug.jsx`)
  - Bug reporting form
  - File attachment
  - Priority/severity selection
- **ViewBugDetails** (`ViewBugDetails.jsx`)
  - Detailed bug information
  - Status updates
  - Comment system

#### 4. Developer Pages (`/pages/Developer/`)
- **DeveloperDashboard** (`DeveloperDashboard.jsx`)
  - Assigned bugs overview
  - Progress tracking
  - Quick status updates
- **AssignedBugs** (`AssignedBugs.jsx`)
  - Bug assignment management
  - Status updates
  - Progress tracking
- **UpdateBugStatus** (`UpdateBugStatus.jsx`)
  - Status change interface
  - Progress updates
  - Resolution notes

### Utility Functions (`/utils/`)
- **axiosInstance**: Configured Axios instance
  - Base URL configuration
  - Token management
  - Error handling
- **apiPaths**: API endpoint constants
- **formatters**: Data formatting utilities
- **validators**: Form validation helpers

## State Management
- Uses React Context for global state management:
  - `UserContext` for user authentication and role management
  - `ChatContext` for chat functionality

## Routing Implementation
- **Route Guards**:
  - `PrivateRoute`: Role-based access control
  - Handles authentication checks
  - Manages loading states
  - Redirects unauthorized access
- **Route Structure**:
1. **Public Routes**:
   - `/login` - User login
   - `/signup` - User registration
   - `/landing` - Landing page

2. **Admin Routes** (`/admin/*`):
   - Dashboard
   - Bug management
   - User management
   - Chat system

3. **Tester Routes** (`/tester/*`):
   - Dashboard
   - Bug reporting
   - Bug viewing
   - My bugs list
   - All bugs list
   - Chat system

4. **Developer Routes** (`/developer/*`):
   - Dashboard
   - Assigned bugs
   - Bug status updates
   - Chat system

## API Integration
- **Axios Instance Configuration**:
  - Base URL setup
  - Token management
  - Error interceptors
  - Request/response transformers
- **API Endpoints**:
  - Authentication endpoints
  - Bug management endpoints
  - User management endpoints
  - Chat system endpoints

## Error Handling
- **Global Error Boundary**:
  - Catches unhandled errors
  - Provides fallback UI
  - Logs errors for debugging
- **API Error Handling**:
  - Network error handling
  - Authentication error handling
  - Validation error handling
- **Form Validation**:
  - Client-side validation
  - Server-side error display
  - Custom validation rules

## Performance Optimizations
- Code splitting through React Router
- Modern build tooling with Vite
- Efficient state management with Context API
- Optimized asset loading

## Security Implementation
- **Authentication**:
  - JWT token management
  - Secure token storage
  - Token refresh mechanism
- **Authorization**:
  - Role-based access control
  - Route protection
  - API endpoint protection
- **Data Protection**:
  - Input sanitization
  - XSS prevention
  - CSRF protection

## Testing Strategy
- Unit testing setup
- Component testing
- Integration testing
- E2E testing

## Deployment
- **Build Process**:
  - Production build optimization
  - Asset optimization
  - Environment configuration
- **Deployment Checklist**:
  - Environment variables
  - API endpoint configuration
  - Build verification
  - Performance testing

## Maintenance
- **Code Organization**:
  - Component documentation
  - Code style guidelines
  - Naming conventions
- **Version Control**:
  - Git workflow
  - Branch management
  - Release process

## Future Improvements
1. Consider implementing:
   - Unit and integration tests
   - Error boundary components
   - Progressive Web App (PWA) features
   - Enhanced caching strategies
   - Performance monitoring
   - Accessibility improvements

## Notes
- The application uses modern React features and hooks
- Implements a clean and maintainable folder structure
- Follows component-based architecture
- Uses modern JavaScript features (ES6+)
- Implements responsive design principles 