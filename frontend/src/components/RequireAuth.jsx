import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAuth(){
  const { accessToken, loading } = useAuth();
  if(loading) return <div className="text-center py-16">Checking authentication...</div>;
  if(!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
