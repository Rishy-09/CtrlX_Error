import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useContext } from 'react';
import Dashboard from "./pages/Admin/Dashboard.jsx";
import { Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/Signup.jsx";
import LandingPage from "./pages/Landing/LandingPage.jsx";

import ManageTasks from "./pages/Admin/ManageTasks.jsx";
import CreateTask from "./pages/Admin/CreateTask.jsx";
import ManageUsers from "./pages/Admin/ManageUsers.jsx";

import UserDashboard from './pages/User/UserDashboard.jsx';
import MyTasks from './pages/User/MyTasks.jsx';
import ViewTaskDetails from './pages/User/ViewTaskDetails.jsx';

import ChatPage from './pages/Chat/ChatPage.jsx';

import PrivateRoute from './routes/PrivateRoute.jsx';
import UserProvider, {UserContext} from './context/userContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { Toaster } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const App = () => {
  return (
    <UserProvider>
      <ChatProvider>
        <div>
          <Router>
            <Routes>
              <Route path="/login" element={<Login/>} />
              <Route path="/signUp" element={<SignUp/>} />
              <Route path="/landing" element={<LandingPage />} />

              {/*Admin Routes*/}
              <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
                <Route path="/admin/dashboard" element={<Dashboard/>} />
                <Route path="/admin/tasks" element={<ManageTasks/>} />
                <Route path="/admin/create-task" element={<CreateTask/>} />
                <Route path="/admin/users" element={<ManageUsers/>} />
                <Route path="/admin/chat" element={<ChatPage />} />
                <Route path="/admin/chat/:chatId" element={<ChatPage />} />
              </Route>

              {/*User Routes*/}
              <Route element={<PrivateRoute allowedRoles={["developer", "tester"]}/>}>
                <Route path="/user/dashboard" element={<UserDashboard/>} />
                <Route path="/user/tasks" element={<MyTasks/>} />
                <Route path="/user/tasks-details/:id" element={<ViewTaskDetails/>} />
                <Route path="/user/chat" element={<ChatPage />} />
                <Route path="/user/chat/:chatId" element={<ChatPage />} />
              </Route>

              {/* Redirect standalone /chat routes to the appropriate role-based route */}
              <Route path="/chat" element={<ChatRedirect />} />
              <Route path="/chat/:chatId" element={<ChatRedirect />} />

              {/*Default Route*/}
              <Route path="/" element={<Navigate to="/landing" />} />

            </Routes>
          </Router>
        </div>

        <Toaster
          toastOptions={{
            className: '',
            style:{
              fontSize: '13px',
            },
          }}
        />
      </ChatProvider>
    </UserProvider>
  );
};

export default App;

// ChatRedirect component to handle redirecting /chat routes to the correct role-based path
const ChatRedirect = () => {
  const { user } = useContext(UserContext);
  const { chatId } = useParams(); // Get the chatId parameter if present
  const navigate = useNavigate();
  
  // Redirect based on user role
  useEffect(() => {
    const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
    navigate(chatId ? `${basePath}/${chatId}` : basePath, { replace: true });
  }, [user, chatId, navigate]);
  
  return null; // This component just redirects, no rendering
}