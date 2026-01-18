import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  FolderOpen, 
  Users, 
  Heart, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Home,
  Terminal,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CLUB_INFO } from '../../utils/constants';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'text-cyan-400' },
    { name: 'Events', href: '/admin/events', icon: Calendar, color: 'text-blue-400' },
    { name: 'Achievements', href: '/admin/achievements', icon: Trophy, color: 'text-yellow-400' },
    { name: 'Projects', href: '/admin/projects', icon: FolderOpen, color: 'text-green-400' },
    { name: 'Members', href: '/admin/members', icon: Users, color: 'text-purple-400' },
    { name: 'Sponsors', href: '/admin/sponsors', icon: Heart, color: 'text-pink-400' },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare, color: 'text-indigo-400' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div className="matrix-bg opacity-10"></div>
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-500/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-effect border-r border-gray-700/50 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-30"></div>
          
          <div className="relative bg-gray-900/90 backdrop-blur-xl h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                    <span className="text-white font-bold text-lg code-font">M</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gradient code-font">{CLUB_INFO.name}</h1>
                  <p className="text-xs text-cyan-400 code-font flex items-center">
                    <Terminal size={10} className="mr-1" />
                    Admin Portal
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50'
                    }`}
                  >
                    {active && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-lg blur opacity-50"></div>
                    )}
                    <div className="relative flex items-center space-x-3">
                      <Icon size={18} className={active ? 'text-cyan-400' : item.color} />
                      <span className="code-font">{item.name}</span>
                      {active && (
                        <div className="absolute -right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* User info and logout */}
            <div className="p-6 border-t border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <span className="text-cyan-400 font-bold text-sm code-font">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate code-font">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate flex items-center">
                    <Shield size={10} className="mr-1" />
                    {user?.role || 'Administrator'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Link
                  to="/"
                  className="group flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 border border-transparent hover:border-gray-700/50"
                >
                  <Home size={16} className="text-green-400" />
                  <span className="code-font">View Site</span>
                  <Zap size={12} className="ml-auto opacity-0 group-hover:opacity-100 text-green-400 transition-opacity" />
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/30"
                >
                  <LogOut size={16} className="text-red-400" />
                  <span className="code-font">Logout</span>
                  <div className="ml-auto w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 relative z-10">
        {/* Top bar */}
        <header className=" top-0 z-30 glass-effect border-b border-gray-700/50 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 transition-all duration-200"
              >
                <Menu size={20} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                  <Terminal size={16} className="text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white code-font">
                    {navigation.find(item => isActive(item.href))?.name || 'Admin Portal'}
                  </h1>
                  <p className="text-xs text-gray-400 code-font">
                    System Status: <span className="text-green-400">Online</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-700/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400 code-font">
                  Welcome, <span className="text-cyan-400">{user?.name}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-6 pt-1 pb-6 relative">
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;