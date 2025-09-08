import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/Signup.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

import { Navigate } from "react-router-dom";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ManageBugs from "./pages/Admin/ManageBugs.jsx";
import ManageUsers from "./pages/Admin/ManageUsers.jsx";
import ViewBugAdmin from "./pages/Admin/ViewBugAdmin.jsx";

import TesterDashboard from "./pages/Tester/TesterDashboard.jsx";
import ReportBug from "./pages/Tester/CreateBug.jsx";
import ViewBugDetails from "./pages/Tester/ViewBugDetails.jsx";
import MyBugs from "./pages/Tester/MyBugs.jsx";
import AllBugs from "./pages/Tester/AllBugs.jsx";

import DeveloperDashboard from './pages/Developer/DeveloperDashboard.jsx';
import ViewAssignedBug from './pages/Developer/ViewAssignedBug';
import AssignedBugs from './pages/Developer/AssignedBugs.jsx';
import UpdateBugStatus from './pages/Developer/UpdateBugStatus.jsx';

import PrivateRoute from "./routes/PrivateRoute.jsx";
import { useUserContext } from "./context/userContext.jsx";
import UserProvider, { UserContext } from "./context/userContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <UserProvider>
      <ChatProvider>
        <div>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/landing" element={<LandingPage />} />

              {/*Admin Routes*/}
              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/bugs" element={<ManageBugs />} />
                <Route path="/admin/bugs/:id" element={<ViewBugAdmin />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/create-bug" element={<ReportBug />} />
                <Route path="/admin/update-bug" element={<Navigate to="/admin/bugs" replace />} />
                <Route path="/admin/chats" element={<ChatPage />} />
              </Route>

              {/* Tester Routes */}
              <Route element={<PrivateRoute allowedRoles={["tester"]}/>}>
                <Route path="/tester/dashboard" element={<TesterDashboard/>} />
                <Route path="/tester/report-bug" element={<ReportBug/>} />
                <Route path="/tester/bug/:id" element={<ViewBugDetails/>} />
                <Route path="/tester/my-bugs" element={<MyBugs/>} />
                <Route path="/tester/all-bugs" element={<AllBugs/>} />
                <Route path="/tester/chats" element={<ChatPage />} />
              </Route>

              {/* Developer Routes */}
              <Route element={<PrivateRoute allowedRoles={["developer"]}/>}>
                <Route path="/developer/dashboard" element={<DeveloperDashboard/>} />
                <Route path="/developer/assigned-bugs" element={<AssignedBugs/>} />
                <Route path="/developer/update-bugs" element={<UpdateBugStatus/>} />
                <Route path="/developer/assigned-bugs/:id" element={<ViewAssignedBug/>} />
                <Route path="/developer/chats" element={<ChatPage />} />
              </Route>

              {/*Default Route*/}
              <Route path="/" element={<Root />} />
            </Routes>
          </Router>
        </div>

        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
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

  if (!user) return <Navigate to="/landing" />;

  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
  if (user.role === "tester") return <Navigate to="/tester/dashboard" />;
  if (user.role === "developer") return <Navigate to="/developer/dashboard" />;
  
  return <Navigate to="/landing" />;
};
