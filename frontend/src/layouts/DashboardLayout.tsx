import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  TrendingUp,
  Package,
  Boxes,
  Briefcase,
  UserPlus
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, token, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const location = useLocation();

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Sync theme to root element data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-main">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Route Guard
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const sidebarSections = [
    {
      title: 'CORE',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] }
      ]
    },
    {
      title: 'CRM',
      items: [
        { label: 'Customers', path: '/customers', icon: <Users size={18} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] }
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { label: 'Products', path: '/products', icon: <Package size={18} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
        { label: 'Stock Movements', path: '/inventory', icon: <Boxes size={18} />, roles: ['ADMIN', 'WAREHOUSE'] }
      ]
    },
    {
      title: 'SALES',
      items: [
        { label: 'Challans', path: '/challans', icon: <TrendingUp size={18} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Accounts', path: '/accounts', icon: <Briefcase size={18} />, roles: ['ADMIN', 'ACCOUNTS'] }
      ]
    },
    {
      title: 'ADMIN',
      items: [
        { label: 'Add Employee', path: '/register', icon: <UserPlus size={18} />, roles: ['ADMIN'] }
      ]
    }
  ];

  const activePage = sidebarSections
    .flatMap((section) => section.items)
    .find((item) => location.pathname.startsWith(item.path));

  return (
    <div className="flex min-h-screen relative bg-bg-main text-white">
      {isMobile && sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}
      {/* Sidebar navigation */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 flex flex-col z-50 transition-all duration-300 border-r border-border-color bg-bg-surface glass ${
          isMobile
            ? (sidebarOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full')
            : (sidebarOpen ? 'w-[260px]' : 'w-[78px]')
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="h-[70px] flex items-center justify-between px-5 border-b border-border-color">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-base shadow shadow-indigo-500/25">
              EC
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg font-heading text-white tracking-tight">
                ERP/CRM
              </span>
            )}
          </div>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800/60 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-4 overflow-y-auto">
          {sidebarSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(item => item.roles.includes(user?.role || ''));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="flex flex-col gap-1 text-left">
                {sidebarOpen && (
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-1">
                    {section.title}
                  </span>
                )}
                {visibleItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      className={`flex items-center p-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                        isActive 
                          ? 'bg-indigo-500/10 text-primary border-l-2 border-primary rounded-l-none' 
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                      } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                    >
                      <span>{item.icon}</span>
                      {sidebarOpen && <span className="ml-3 text-zinc-300">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-border-color">
          <button 
            onClick={logout} 
            className={`flex items-center w-full p-3 rounded-lg text-[14px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-[78px]'
        }`}
      >
        {/* Top Header Bar */}
        <header className="h-[70px] flex items-center px-5 sm:px-8 sticky top-0 z-30 border-b border-border-color bg-bg-surface/85 glass">
          {(!sidebarOpen || isMobile) && (
            <button 
              onClick={() => setSidebarOpen(true)} 
              aria-label="Open navigation"
              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/60 transition-colors mr-3"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="min-w-0 text-left">
            <h1 className="font-heading text-base sm:text-lg font-bold tracking-tight text-white truncate">
              {activePage?.label || 'Workspace'}
            </h1>
            <p className="hidden sm:block text-[11px] font-medium text-zinc-500">
              Manage your operations in one place
            </p>
          </div>
          
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center justify-center p-2 rounded-full border border-border-color hover:bg-zinc-900/80 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} className="text-zinc-300" /> : <Moon size={18} className="text-zinc-800" />}
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-3 border-l border-border-color pl-5">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-primary flex items-center justify-center font-bold border border-indigo-500/30">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-white tracking-tight">
                  {user?.name}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body Routing Outlets */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
