import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  MessageCircle,
  Upload,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to ||
              (to !== '/' && location.pathname.startsWith(to));

            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center w-full h-full px-2 py-1 rounded-lg transition-all duration-200 touch-manipulation ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-primary-600' : ''}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
