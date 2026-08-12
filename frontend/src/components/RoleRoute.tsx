import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, token, loading } = useAuth();

  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};
