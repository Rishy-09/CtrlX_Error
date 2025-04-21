import React, { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { UserContext } from '../context/userContext'

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext)
  
  if (loading) {
    // Return loading state
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // If allowedRoles is defined and user's role is not included, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user's role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/user/dashboard" replace />
    }
  }
  
  // User is authenticated and authorized, render the outlet
  return <Outlet />
}

export default PrivateRoute