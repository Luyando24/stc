import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const AdminProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { currentAdmin, isSuperAdmin, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;