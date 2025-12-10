import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAdmin(){
  const { user, loading } = useAuth();
  if(loading) return <div className="text-center py-16">Checking authentication...</div>;
  if(!user) return <Navigate to="/login" replace />;
  if(user.role !== 'admin') return <div className="text-center py-16">Forbidden — admin only</div>;
  return <Outlet />;
}
