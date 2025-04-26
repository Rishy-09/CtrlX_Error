import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useContext } from 'react';
import Dashboard from "./pages/Admin/Dashboard.jsx";
import { Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/Signup.jsx";
import LandingPage from "./pages/Landing/LandingPage.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import PricingPage from "./pages/Pricing/PricingPage.jsx";

import ManageTasks from "./pages/Admin/ManageTasks.jsx";
import CreateTask from "./pages/Admin/CreateTask.jsx";
import ManageUsers from "./pages/Admin/ManageUsers.jsx";

import UserDashboard from './pages/User/UserDashboard.jsx';
import MyTasks from './pages/User/MyTasks.jsx';
import ViewTaskDetails from './pages/User/ViewTaskDetails.jsx';
import UserSettings from './pages/User/UserSettings.jsx';

import ChatPage from './pages/Chat/ChatPage.jsx';
import MongoIdValidator from './components/MongoIdValidator.jsx';

// Footer pages
import TermsOfService from './pages/Terms/TermsOfService.jsx';
// import PrivacyPolicy from './pages/Terms/PrivacyPolicy.jsx';
import DataStoragePolicy from './pages/Terms/DataStoragePolicy.jsx';
import Features from './pages/Features/Features.jsx';
import About from './pages/Company/About';
import Contact from './pages/Company/Contact.jsx';

import PrivateRoute from './routes/PrivateRoute.jsx';
import UserProvider, {UserContext} from './context/userContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { Toaster } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isValidMongoId } from './utils/routeValidators.js';

// Add import for NotFound page
import NotFound from './pages/NotFound/NotFound.jsx';

const App = () => {
  return (
    <UserProvider>
      <ChatProvider>
        <div>
          <Router>
          <Analytics />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login/>} />
              <Route path="/signUp" element={<SignUp/>} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/pricing" element={<PricingPage />} />
              
              {/* Footer Pages */}
              <Route path="/terms" element={<TermsOfService />} />
              {/*<Route path="/privacy" element={<PrivacyPolicy />} />*/}
              <Route path="/cookies" element={<DataStoragePolicy />} />
              <Route path="/data-storage" element={<DataStoragePolicy />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/*Admin Routes*/}
              <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
                <Route path="/admin/dashboard" element={<Dashboard/>} />
                <Route path="/admin/tasks" element={<ManageTasks/>} />
                <Route path="/admin/create-task" element={<CreateTask/>} />
                <Route path="/admin/users" element={<ManageUsers/>} />
                <Route path="/admin/chat" element={<ChatPage />} />
                <Route path="/admin/chat/:chatId" element={
                  <MongoIdValidator 
                    paramName="chatId" 
                    fallbackPath="/admin/chat"
                    toastMessage="Invalid chat ID format. Redirecting to chat list."
                  >
                    <ChatPage />
                  </MongoIdValidator>
                } />
                <Route path="/admin/settings" element={<UserSettings />} />
                <Route path="/admin/profile" element={<Navigate to="/admin/settings" replace />} />
              </Route>

              {/*User Routes*/}
              <Route element={<PrivateRoute allowedRoles={["developer", "tester"]}/>}>
                <Route path="/user/dashboard" element={<UserDashboard/>} />
                <Route path="/user/tasks" element={<MyTasks/>} />
                <Route path="/user/tasks-details/:id" element={
                  <MongoIdValidator
                    paramName="id"
                    fallbackPath="/user/tasks"
                    toastMessage="Invalid task ID format. Redirecting to tasks list."
                  >
                    <ViewTaskDetails />
                  </MongoIdValidator>
                } />
                <Route path="/user/chat" element={<ChatPage />} />
                <Route path="/user/chat/:chatId" element={
                  <MongoIdValidator 
                    paramName="chatId" 
                    fallbackPath="/user/chat"
                    toastMessage="Invalid chat ID format. Redirecting to chat list."
                  >
                    <ChatPage />
                  </MongoIdValidator>
                } />
                <Route path="/user/settings" element={<UserSettings />} />
                <Route path="/user/profile" element={<Navigate to="/user/settings" replace />} />
              </Route>

              {/* Redirect standalone /chat routes to the appropriate role-based route */}
              <Route path="/chat" element={<ChatRedirect />} />
              <Route path="/chat/:chatId" element={<ChatRedirectWithValidation />} />
              
              {/* Redirect /profile to the appropriate settings page */}
              <Route path="/profile" element={<ProfileRedirect />} />

              {/*Default Route*/}
              <Route path="/" element={<Navigate to="/landing" />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
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
  const navigate = useNavigate();
  
  // Redirect based on user role
  useEffect(() => {
    const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
    navigate(basePath, { replace: true });
  }, [user, navigate]);
  
  return null; // This component just redirects, no rendering
}

// ChatRedirectWithValidation to validate chatId before redirecting
const ChatRedirectWithValidation = () => {
  const { user } = useContext(UserContext);
  const { chatId } = useParams();
  const navigate = useNavigate();
  
  // Redirect based on user role and validate chatId
  useEffect(() => {
    const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
    
    if (chatId && !isValidMongoId(chatId)) {
      // Invalid chatId, redirect to base chat path
      navigate(basePath, { replace: true });
    } else {
      // Valid chatId, redirect to the specific chat
      navigate(`${basePath}/${chatId}`, { replace: true });
    }
  }, [user, chatId, navigate]);
  
  return null;
}

// ProfileRedirect component to handle redirecting /profile to the correct settings page
const ProfileRedirect = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Redirect based on user role
  useEffect(() => {
    const settingsPath = user?.role === 'admin' ? '/admin/settings' : '/user/settings';
    navigate(settingsPath, { replace: true });
  }, [user, navigate]);
  
  return null; // This component just redirects, no rendering
}