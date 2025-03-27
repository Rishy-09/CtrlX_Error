import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import TesterDashboard from './pages/TesterDashboard';
import Projects from './pages/Projects';
import Issues from './pages/Issues';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useState } from 'react';

function App() {
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'developer', 'tester'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar userRole={userRole} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header userRole={userRole} setUserRole={setUserRole} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    {getDashboardByRole()}
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar userRole={userRole} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header userRole={userRole} setUserRole={setUserRole} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <Projects userRole={userRole} />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/issues" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar userRole={userRole} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header userRole={userRole} setUserRole={setUserRole} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <Issues userRole={userRole} />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;