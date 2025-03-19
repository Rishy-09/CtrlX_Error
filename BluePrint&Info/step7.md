/bug-tracking-frontend
│── 📂 public
│   ├── 📄 index.html               # Main HTML template
│   ├── 📄 favicon.ico              # App icon
│   ├── 📂 assets/                  # Static assets (logos, images)
│
│── 📂 src
│   ├── 📂 api/                      # API Calls (Axios)
│   │   ├── 📄 authAPI.js            # Login, Signup, Logout
│   │   ├── 📄 userAPI.js            # Fetch users, update roles
│   │   ├── 📄 bugAPI.js             # CRUD operations for bugs
│   │   ├── 📄 commentAPI.js         # Add/fetch comments on bugs
│   │   ├── 📄 statsAPI.js           # Fetch dashboard stats
│
│   ├── 📂 components/               # Reusable UI components
│   │   ├── 📂 auth/
│   │   │   ├── 📄 LoginForm.jsx
│   │   │   ├── 📄 SignupForm.jsx
│   │   │   ├── 📄 LogoutButton.jsx
│   │   ├── 📂 common/
│   │   │   ├── 📄 Navbar.jsx        # Top navigation bar
│   │   │   ├── 📄 Sidebar.jsx       # Sidebar for navigation
│   │   │   ├── 📄 Modal.jsx         # Reusable modal component
│   │   ├── 📂 bugs/
│   │   │   ├── 📄 BugCard.jsx       # Bug item in list
│   │   │   ├── 📄 BugDetails.jsx    # Detailed bug view
│   │   │   ├── 📄 BugForm.jsx       # Create/Edit bug form
│   │   ├── 📂 dashboard/
│   │   │   ├── 📄 StatsCard.jsx     # Individual statistics cards
│   │   │   ├── 📄 Chart.jsx         # Bug tracking charts
│   │   ├── 📂 comments/
│   │   │   ├── 📄 CommentBox.jsx    # Comment input field
│   │   │   ├── 📄 CommentList.jsx   # List of comments
│
│   ├── 📂 contexts/                 # React Context API
│   │   ├── 📄 AuthContext.jsx        # Auth state management
│   │   ├── 📄 BugContext.jsx         # Bug state management
│
│   ├── 📂 hooks/                     # Custom React Hooks
│   │   ├── 📄 useAuth.js             # Manage user auth state
│   │   ├── 📄 useBugs.js             # Fetch and manage bugs
│
│   ├── 📂 pages/                     # Full-page components
│   │   ├── 📄 Login.jsx              # Login page
│   │   ├── 📄 Signup.jsx             # Signup page
│   │   ├── 📄 Dashboard.jsx          # Dashboard with stats
│   │   ├── 📄 BugList.jsx            # List of all bugs
│   │   ├── 📄 BugDetailsPage.jsx     # Detailed bug page
│   │   ├── 📄 Profile.jsx            # User profile page
│
│   ├── 📂 routes/                    # App Routing
│   │   ├── 📄 PrivateRoute.jsx        # Restrict routes based on auth
│   │   ├── 📄 AppRoutes.jsx           # Define all frontend routes
│
│   ├── 📂 styles/                    # Styling (CSS or Tailwind)
│   │   ├── 📄 global.css              # Global styles
│   │   ├── 📄 dashboard.css           # Dashboard-specific styles
│
│   ├── 📄 main.jsx                    # Entry point for React
│   ├── 📄 App.jsx                      # Main App component
│
│── 📄 .env                            # Environment variables
│── 📄 package.json                     # Dependencies
│── 📄 vite.config.js                   # Vite configuration
│── 📄 README.md                        # Documentation
