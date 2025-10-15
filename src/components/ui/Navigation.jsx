import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Plane, 
  Shield, 
  DollarSign, 
  FolderOpen, 
  BarChart3, 
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  LogOut,
  User,
  Bell
} from 'lucide-react';
import ThemeToggle from '../../theme-toggle';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'policy', label: 'Policy Builder', icon: FileText, path: '/policy' },
  { id: 'trips', label: 'Trips', icon: Plane, path: '/trips' },
  { id: 'risk', label: 'Risk Management', icon: Shield, path: '/risk' },
  { id: 'expense', label: 'Expense', icon: DollarSign, path: '/expense' },
  { id: 'documents', label: 'Documents', icon: FolderOpen, path: '/documents' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' }
];

export default function Navigation({ collapsed, setCollapsed, user, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full z-40
        ${collapsed ? 'w-20' : 'w-72'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        transition-all duration-300 ease-out
        bg-gradient-to-b from-purple-600 to-purple-800
        shadow-2xl shadow-purple-900/50
      `}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              {!collapsed && (
                <div className="animate-in">
                  <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                  <p className="text-xs text-purple-200">{role || 'Administrator'}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {collapsed ? 
                <ChevronRight className="w-5 h-5 text-white" /> : 
                <ChevronLeft className="w-5 h-5 text-white" />
              }
            </button>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className={`p-4 border-b border-white/10 ${collapsed ? 'px-2' : ''}`}>
            <div className={`
              flex items-center gap-3 p-3 rounded-xl 
              bg-white/10 backdrop-blur hover:bg-white/20 
              transition-all duration-200 cursor-pointer
              ${collapsed ? 'justify-center' : ''}
            `}>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 animate-in">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-purple-200">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3
                  px-4 py-3 rounded-xl
                  transition-all duration-200
                  group relative
                  ${collapsed ? 'justify-center px-3' : ''}
                  ${active ? 
                    'bg-white text-purple-700 shadow-lg' : 
                    'text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-purple-700' : 'text-white'}`} />
                {!collapsed && (
                  <span className="font-medium animate-in">{item.label}</span>
                )}
                {collapsed && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2
                    bg-gray-900 text-white text-sm
                    rounded-lg opacity-0 pointer-events-none
                    group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-opacity duration-200
                    whitespace-nowrap z-50
                  ">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-2">
          <ThemeToggle />
          <button className={`
            w-full flex items-center gap-3
            px-4 py-3 rounded-xl
            text-white hover:bg-white/10
            transition-all duration-200
            ${collapsed ? 'justify-center px-3' : ''}
          `}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </button>
          <button className={`
            w-full flex items-center gap-3
            px-4 py-3 rounded-xl
            text-white hover:bg-red-500/20 hover:text-red-200
            transition-all duration-200
            ${collapsed ? 'justify-center px-3' : ''}
          `}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export function TopBar({ title, user, showNotifications = true }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        
        <div className="flex items-center gap-4">
          {showNotifications && (
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          )}
          
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
