// utils/routes.jsx -- Paths, layouts, and components for routing
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import Auth from "../layouts/Auth";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Home/Home";
import TaskDetails from "../pages/User/TaskDetails";
import AllTasks from "../pages/User/AllTasks";
import ViewTaskDetails from "../pages/User/ViewTaskDetails";
import Profile from "../pages/User/Profile";
import Dashboard from "../pages/User/Dashboard";
import CreateTask from "../pages/User/CreateTask";
import UsersPage from "../pages/Admin/UsersPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import { UserContext } from "../context/userContext";
import BugTracking from "../pages/User/BugTracking";
import BugList from "../pages/User/BugList";
import ViewBugDetails from "../pages/User/ViewBugDetails";
import ChatPage from "../pages/Chat/ChatPage";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, authInitialized } = useContext(UserContext);

  if (!authInitialized) {
    // Auth state not initialized yet
    return null;
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const RequireRole = ({ children, roles }) => {
  const { user, authInitialized } = useContext(UserContext);

  if (!authInitialized) {
    // Auth state not initialized yet
    return null;
  }

  if (!user || !roles.includes(user.role)) {
    // User doesn't have required role, redirect to 404
    return <Navigate to="/404" replace />;
  }

  return children;
};

const routes = [
  {
    path: "/login",
    element: <Auth />,
    children: [
      {
        path: "",
        element: <Login />,
      },
    ],
  },
  {
    path: "/register",
    element: <Auth />,
    children: [
      {
        path: "",
        element: <Register />,
      },
    ],
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/user",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "all-tasks",
        element: <AllTasks />,
      },
      {
        path: "task/:id",
        element: <ViewTaskDetails />,
      },
      {
        path: "create-task",
        element: (
          <RequireRole roles={["admin", "developer"]}>
            <CreateTask />
          </RequireRole>
        ),
      },
      {
        path: "task-details",
        element: <TaskDetails />,
      },
      {
        path: "bug-tracking",
        element: <BugTracking />,
      },
      {
        path: "bugs",
        element: <BugList />,
      },
      {
        path: "bug/:id",
        element: <ViewBugDetails />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "chat/:chatId",
        element: <ChatPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <RequireRole roles={["admin"]}>
          <MainLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
    ],
  },
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];

export default routes; 