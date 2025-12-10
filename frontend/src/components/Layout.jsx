import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout(){
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-accent flex items-center justify-center text-white font-bold">IA</div>
            <div>
              <div className="text-lg font-semibold text-primary">IAM College Portal</div>
              <div className="text-xs text-muted">Secure access for students & faculty</div>
            </div>
          </Link>

          <nav className="flex items-center space-x-3">
            <Link to="/" className="text-sm text-muted hover:text-primary">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-muted hover:text-primary">Dashboard</Link>
                {user.role === 'admin' && <Link to="/admin" className="text-sm text-muted hover:text-primary">Admin</Link>}
                <button onClick={logout} className="text-sm text-red-500">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-primary font-medium">Sign in</Link>
                <Link to="/register" className="text-sm text-muted">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
