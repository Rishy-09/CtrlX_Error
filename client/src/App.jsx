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
              <Route element={<PrivateRoute allowedRoles={["member"]}/>}>
                <Route path="/user/dashboard" element={<UserDashboard/>} />
                <Route path="/user/tasks" element={<MyTasks/>} />
                <Route path="/user/tasks-details/:id" element={<ViewTaskDetails/>} />
                <Route path="/user/chat" element={<ChatPage />} />
                <Route path="/user/chat/:chatId" element={<ChatPage />} />
              </Route>

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

const Root = () => {
  const {user, loading} = useContext(UserContext);

  if (loading) return <Outlet/>;

  if (!user){
    return <Navigate to="/landing" />;
  }

  return user.role === "admin" ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/dashboard" />;
}