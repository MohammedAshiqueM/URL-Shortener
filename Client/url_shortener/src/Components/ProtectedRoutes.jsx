import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Protected route that requires authentication
export const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

// Route that requires admin role
export const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'admin') {
    // Redirect to home if not admin
    return <Navigate to="/home" replace />;
  }
  
  return <Outlet />;
};

// Route that requires authentication but redirects admins to admin page
export const UserRoute = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  if (user.role === 'admin') {
    // Redirect admins to admin page
    return <Navigate to="/admin" replace />;
  }
  
  return <Outlet />;
};

// Route that is only accessible when not logged in
export const PublicRoute = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    // Redirect to appropriate home page based on role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace />;
  }
  
  return <Outlet />;
};