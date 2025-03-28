import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminDashboard from '../pages/AdminDashboard';
import DeveloperDashboard from '../pages/DeveloperDashboard';
import TesterDashboard from '../pages/TesterDashboard';
import Projects from '../pages/Projects';
import Issues from '../pages/Issues';
import Layout from '../components/Layout';

// Protected Route wrapper component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AppRoutes = ({ isAuthenticated, setIsAuthenticated }) => {
  const [userRole, setUserRole] = useState('admin');

  // Map roles to respective dashboard components
  const roleBasedDashboard = {
    admin: <AdminDashboard />,
    developer: <DeveloperDashboard />,
    tester: <TesterDashboard />
  };

  // Function to get the appropriate dashboard component
  const getDashboardByRole = (role) => {
    return roleBasedDashboard[role] || <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout userRole={userRole} setUserRole={setUserRole}>
              {getDashboardByRole(userRole)}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout userRole={userRole} setUserRole={setUserRole}>
              <Projects userRole={userRole} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/issues"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout userRole={userRole} setUserRole={setUserRole}>
              <Issues userRole={userRole} />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
