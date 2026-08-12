import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthLayout: React.FC = () => {
  const { token } = useAuth();
  const location = useLocation();

  // If already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-bg-main">
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,rgba(0,0,0,0)_70%)] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.12)_0%,rgba(0,0,0,0)_70%)] -z-10 pointer-events-none"></div>
      
      {/* Auth Card Container */}
      <div className="glass w-full max-w-[480px] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-primary-glow border border-white/5 z-10">
        <div className="flex flex-col items-center text-center mb-6">
          {/* Logo Badge */}
          <div className="w-[56px] h-[56px] rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-xl font-heading">EC</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 font-heading tracking-tight">ERP / CRM Suite</h1>
          <p className="text-[13px] text-zinc-500">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        
        {/* Child Router Outlets */}
        <Outlet />
      </div>
    </div>
  );
};
