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
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Pricing from '../pages/Pricing';
import About from '../pages/About';
import Layout from '../components/Layout';
import BugList from '../pages/BugList';
import Bug from '../../../backend/models/Bug';

export default function AppRoutes({ isAuthenticated, setIsAuthenticated }) {
  const [userRole, setUserRole] = useState('admin');

  const getDashboardByRole = () => {
    switch(userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'developer':
        return <DeveloperDashboard />;
      case 'tester':
        return <TesterDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Public Routes wrapper
  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login setIsAuthenticated={setIsAuthenticated} />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout userRole={userRole} setUserRole={setUserRole}>
            {getDashboardByRole()}
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout userRole={userRole} setUserRole={setUserRole}>
            <Projects userRole={userRole} />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/issues" element={
        <ProtectedRoute>
          <Layout userRole={userRole} setUserRole={setUserRole}>
            <Issues userRole={userRole} />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout userRole={userRole} setUserRole={setUserRole}>
            <Reports userRole={userRole} />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout userRole={userRole} setUserRole={setUserRole}>
            <Settings userRole={userRole} />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/buglist" element={<BugList />} />
    </Routes>
  );
}