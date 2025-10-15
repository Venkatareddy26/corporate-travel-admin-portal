import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Plane, Shield, DollarSign, 
  FolderOpen, BarChart3, TrendingUp, Users, MapPin, 
  Calendar, Clock, AlertTriangle, CheckCircle, Menu, X,
  ChevronRight, ChevronLeft, Settings, LogOut, User, Bell
} from 'lucide-react';
import ThemeToggle from './theme-toggle';
import GlobalMap from './components/GlobalMap';
import RiskFeed from './components/RiskFeed';
import WidgetManager from './components/WidgetManager';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { StatCard, StatsGrid, MiniStat } from './components/ui/Stats';
import Button from './components/ui/Button';
import Badge, { StatusBadge } from './components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import Modal, { ModalFooter } from './components/ui/Modal';

// Modern Travel Dashboard with Beautiful UI/UX

const summary = {
  airfare: 5863.52,
  hotels: 5772.44,
  cars: 2952.27,
  total: 12586.21,
  trips: 44,
  travelers: 7,
  destinations: 26,
  avgPlanBook: '12h 21m',
  avgApproval: 'N/A',
};

const reasonsData = [
  { name: 'Client Visit', value: 35 },
  { name: 'No Reason', value: 20 },
  { name: 'Company office visit', value: 15 },
  { name: 'Internal event', value: 8 },
  { name: 'Conference', value: 7 },
  { name: 'Deployment', value: 6 },
  { name: 'Team bonding', value: 4 },
  { name: 'Other', value: 3 },
  { name: 'Professional', value: 2 },
];

const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#faf5ff', '#fefcff'];
const DESTINATION_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

export default function TravelDashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [chartCard, setChartCard] = useState(null);
  const [visibleWidgets, setVisibleWidgets] = useState(() => {
    try{ const raw = localStorage.getItem('dashboard_widgets'); if(raw) return JSON.parse(raw); }catch{};
    return ['tripFrequency','topDestinations','riskFeed'];
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) || { name: 'Admin Name', email: 'admin@example.com' } } catch { return { name: 'Admin Name', email: 'admin@example.com' } }
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [roleLocal, setRoleLocal] = useState(() => localStorage.getItem('currentRole') || 'employee');
  const location = useLocation();
  const roleDisplay = roleLocal ? roleLocal.charAt(0).toUpperCase() + roleLocal.slice(1) : 'Administrator';

  useEffect(()=>{
    function onStorage(e){
      if(e.key === 'currentUser'){
        try{ setUser(JSON.parse(e.newValue)) }catch{ }
      }
      if(e.key === 'currentRole'){
        try{ setRoleLocal(e.newValue || 'employee') }catch{}
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    function onClick(e){
      if(profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  function updateRole(r){
    localStorage.setItem('currentRole', r);
    setRoleLocal(r);
    // notify other components in the same window
    window.dispatchEvent(new CustomEvent('role-updated', { detail: r }));
  }

  function doLogout(){
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentUser');
    setUser({ name: 'Guest', email: '' });
    setRoleLocal('employee');
    window.dispatchEvent(new Event('logout'));
    navigate('/');
  }

  function isActive(path) {
    return location && location.pathname === path;
  }

  function go(path, opts) {
    if (opts) navigate(path, opts);
    else navigate(path);
  }

  function toggleExpand(id){
    setExpandedCard((s) => s === id ? null : id);
  }

  function openChartCard({ title = 'Details', item = {}, index = 0, dataset = [], colors = [] } = {}){
    const total = (dataset || []).reduce((s, it) => s + (it.value || 0), 0) || 1;
    const pct = Math.round(((item.value || 0) / total) * 100);
    setChartCard({ title, name: item.name || item.label || 'Item', value: item.value || 0, pct, color: colors[index % colors.length] || 'var(--accent)' });
  }

  function closeChartCard(){ setChartCard(null); }

  useEffect(() => {
    function onKey(e){ if(e.key === 'Escape') closeChartCard(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen app-root p-8 font-sans text-gray-800">
      {chartCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40" onClick={closeChartCard} />
          <div className="bg-white rounded-lg p-6 shadow-xl z-50 w-[min(720px,95%)]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="section-heading text-lg">{chartCard.title}</h3>
                <div className="section-subheading mt-1">{chartCard.name}</div>
              </div>
              <div>
                <button className="px-3 py-1 border rounded" onClick={closeChartCard} aria-label="Close">Close</button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div style={{width:64, height:64, borderRadius:8, background:chartCard.color}} />
              <div>
                <div className="stat-number text-2xl">{chartCard.value}</div>
                <div className="section-subheading text-sm mt-1">{chartCard.pct}% of total</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-6 max-w-[1400px] mx-auto">
  <aside className={`sidebar ${collapsed ? 'collapsed' : ''} sticky top-8 self-start`}>
          {/* Sidebar Header with Logo and Title */}
          <div className="sidebar-top">
            <div className="flex items-center gap-3">
              <div className="sidebar-logo">TD</div>
              {!collapsed && <div className="nav-label">Travel</div>}
            </div>
            <button className="btn btn-outline btn-icon" onClick={() => setCollapsed((s) => !s)} aria-label="Toggle sidebar" title="Toggle sidebar">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                {collapsed ? (
                  <path d="M12.5 5l-4 5 4 5" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M7.5 5l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>

          <nav className="nav">
            <button title="Dashboard" aria-current={isActive('/') ? 'page' : undefined} className={`nav-button ${isActive('/') ? 'nav-active' : ''}`} onClick={() => go('/')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 21V12h14v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Dashboard</span>
            </button>
            <button title="Policy" aria-current={isActive('/policy') ? 'page' : undefined} className={`nav-button ${isActive('/policy') ? 'nav-active' : ''}`} onClick={() => go('/policy', { state: { fromDashboard: true } }) } type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Policy</span>
            </button>
            <button title="Trips" aria-current={isActive('/trips') ? 'page' : undefined} className={`nav-button ${isActive('/trips') ? 'nav-active' : ''}`} onClick={() => go('/trips')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7h18v10H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Trips</span>
            </button>
            <button title="Reports" aria-current={isActive('/reports') ? 'page' : undefined} className={`nav-button ${isActive('/reports') ? 'nav-active' : ''}`} onClick={() => go('/reports')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h18v4H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 11h18v10H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Reports</span>
            </button>

            <button title="Dashboard v2" aria-current={isActive('/dashboard1') ? 'page' : undefined} className={`nav-button ${isActive('/dashboard1') ? 'nav-active' : ''}`} onClick={() => go('/dashboard1')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h18v4H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 11h18v10H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Dashboard v2</span>
            </button>

            <button title="Documents" aria-current={isActive('/documents') ? 'page' : undefined} className={`nav-button ${isActive('/documents') ? 'nav-active' : ''}`} onClick={() => go('/documents')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3h10v4H7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Documents</span>
            </button>

            <button title="Risk" aria-current={isActive('/risk') ? 'page' : undefined} className={`nav-button ${isActive('/risk') ? 'nav-active' : ''}`} onClick={() => go('/risk')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 22h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 12l5-7 5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Risk</span>
            </button>

            <button title="Expense" aria-current={isActive('/expense') ? 'page' : undefined} className={`nav-button ${isActive('/expense') ? 'nav-active' : ''}`} onClick={() => go('/expense')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Expense</span>
            </button>

            <button title="Analytics" aria-current={isActive('/analytics') ? 'page' : undefined} className={`nav-button ${isActive('/analytics') ? 'nav-active' : ''}`} onClick={() => go('/analytics')} type="button">
              <span className="nav-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 14V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 14v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 14v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="nav-label">Analytics</span>
            </button>
          </nav>

          {/* Admin Profile at Bottom */}
          <div className="admin-profile" ref={profileRef}>
            <div className="admin-info-wrap">
              <div className="admin-avatar">{(user && user.name) ? user.name.charAt(0).toUpperCase() : 'A'}</div>
              <div className="admin-meta">
                <div className="admin-name-row">
                  <span className="admin-name">{user?.name || 'Admin Name'}</span>
                </div>
                <span className="admin-role-chip">{roleDisplay}</span>
                <span className="admin-email">{user?.email || 'admin@example.com'}</span>
              </div>
            </div>
            <button className="btn btn-outline btn-icon" aria-haspopup="true" aria-expanded={profileOpen} onClick={() => setProfileOpen((s) => !s)} aria-label="Open profile menu" title="Profile">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {profileOpen && (
              <div className="profile-menu" role="menu" aria-label="Profile menu">
                <div className="profile-menu-header">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User avatar'} className="profile-avatar" />
                  ) : (
                    <div className="profile-avatar">{(user && user.name) ? user.name.charAt(0).toUpperCase() : 'A'}</div>
                  )}
                  <div>
                    <div className="font-semibold" style={{color:'var(--card-text)'}}>{user?.name || 'Admin Name'}</div>
                    <div className="text-xs text-muted">{user?.email || 'admin@example.com'}</div>
                  </div>
                </div>

                <div className="profile-menu-divider" />

                <button type="button" className="profile-menu-item" onClick={() => { setProfileOpen(false); go('/policy'); }}>Profile</button>
                <button type="button" className="profile-menu-item" onClick={() => { setProfileOpen(false); go('/reports'); }}>Settings</button>
                
                <div className="profile-menu-divider" />
                
                <div className="profile-menu-section">
                  <label className="profile-menu-label">Switch role</label>
                  <select value={roleLocal} onChange={e => updateRole(e.target.value)} className="profile-menu-select">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                
                <div className="profile-menu-divider" />
                
                <button type="button" className="profile-menu-item profile-logout" onClick={() => { doLogout(); }}>Logout</button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <div className="max-w-[1160px] mx-auto surface-card p-7">
            {/* Enhanced Header */}
            <header className="mb-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 opacity-60 rounded-3xl"></div>
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h1 className="section-heading text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Travel Dashboard
                    </h1>
                    <p className="section-subheading mt-4 max-w-2xl text-lg leading-relaxed">
                      Comprehensive oversight of company travel, spending analytics, and traveler safety monitoring in real-time.
                    </p>
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">Live Data</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Last updated: {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Enhanced KPI Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: 'Airfare Spend',
                  value: `$${summary.airfare.toLocaleString()}`,
                  badge: '+ 8.4% vs last month',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  ),
                  gradient: 'from-purple-500 to-indigo-500',
                  bgGradient: 'from-purple-50 to-indigo-50',
                  borderColor: 'border-purple-200'
                },
                {
                  label: 'Hotels Spend',
                  value: `$${summary.hotels.toLocaleString()}`,
                  badge: '+ 6.1% vs last month',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  ),
                  gradient: 'from-sky-500 to-cyan-500',
                  bgGradient: 'from-sky-50 to-cyan-50',
                  borderColor: 'border-sky-200'
                },
                {
                  label: 'Ground & Cars',
                  value: `$${summary.cars.toLocaleString()}`,
                  badge: '- 3.3% vs last month',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-1-1V8a1 1 0 00-1-1H9m4 8V8a1 1 0 00-1-1H9"></path>
                    </svg>
                  ),
                  gradient: 'from-amber-500 to-orange-500',
                  bgGradient: 'from-amber-50 to-orange-50',
                  borderColor: 'border-amber-200'
                },
                {
                  label: 'Total Travel Spend',
                  value: `$${summary.total.toLocaleString()}`,
                  badge: 'Budget utilization 78%',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  ),
                  gradient: 'from-emerald-500 to-teal-500',
                  bgGradient: 'from-emerald-50 to-teal-50',
                  borderColor: 'border-emerald-200'
                }
              ].map((card) => (
                <article key={card.label} className={`surface-card p-6 bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center shadow-lg`}>
                      {card.icon}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${card.gradient} text-white shadow-sm`}>
                      {card.badge}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </article>
              ))}
            </section>

            {/* Enhanced Secondary Metrics */}
            <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {[
                { 
                  label: 'Active Trips', 
                  value: summary.trips, 
                  hint: 'Last 30 days',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  ),
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-200'
                },
                { 
                  label: 'Travellers', 
                  value: summary.travelers, 
                  hint: 'Unique employees',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  ),
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50',
                  borderColor: 'border-emerald-200'
                },
                { 
                  label: 'Destinations', 
                  value: summary.destinations, 
                  hint: 'Countries covered',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  ),
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50',
                  borderColor: 'border-purple-200'
                },
                { 
                  label: 'Plan-to-Book', 
                  value: summary.avgPlanBook, 
                  hint: 'Average turnaround',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  ),
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50',
                  borderColor: 'border-amber-200'
                },
                { 
                  label: 'Approval Time', 
                  value: summary.avgApproval, 
                  hint: 'Manager response',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  ),
                  color: 'text-cyan-600',
                  bgColor: 'bg-cyan-50',
                  borderColor: 'border-cyan-200'
                },
              ].map((item) => (
                <div key={item.label} className={`surface-card p-6 ${item.bgColor} border ${item.borderColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                      <div className={item.color}>
                        {item.icon}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${item.color} mb-2`}>{item.value}</div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.hint}</div>
                  </div>
                </div>
              ))}
            </section>
            {/* Main content */}
            <section className="grid grid-cols-12 gap-6">
              <div className="col-span-7 chart-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="section-heading text-xl">Corporate reasons for travelling</h3>
                    <p className="section-subheading mt-1">Hover a segment or card to explore contribution share.</p>
                  </div>
                  {selectedReason && (
                    <button className="px-3 py-1.5 rounded-full border border-purple-300 text-purple-700 text-xs bg-white/70 hover:bg-white transition" onClick={() => setSelectedReason(null)}>
                      Clear filter
                    </button>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div className="flex justify-center">
                    <DynamicPieChart
                      data={reasonsData}
                      colors={COLORS}
                      size={300}
                      onSliceClick={(item, i) => {
                        setSelectedReason(item.name);
                        openChartCard({ title: 'Reason details', item, index: i, dataset: reasonsData, colors: COLORS });
                      }}
                    />
                  </div>

                  <div className="w-full">
                    <div className="chart-legend">
                      {reasonsData.map((r, i) => {
                        const portion = ((r.value || 0) / reasonsData.reduce((s, item) => s + item.value, 0)) * 100;
                        const active = selectedReason === r.name;
                        return (
                          <button
                            key={r.name}
                            type="button"
                            className={`chart-legend-item text-left ${active ? 'ring-2 ring-purple-400/60' : ''}`}
                            onClick={() => setSelectedReason(active ? null : r.name)}
                          >
                            <span className="chart-legend-content">
                              <span className="chart-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="chart-legend-label">{r.name}</span>
                            </span>
                            <span className="chart-legend-metric">{r.value} - {portion.toFixed(0)}%</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-5 surface-card p-6">
                <div className="space-y-6">
                  <div
                    className="bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-lg p-4 flex items-center justify-between kpi-card-clickable"
                    onClick={() => toggleExpand('flights') }
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <div className="stat-label text-white/80">Flights</div>
                      <div className="stat-number text-2xl text-white leading-tight">21</div>
                    </div>
                    <div className="text-right">
                      <div className="stat-number text-base text-white leading-tight">17,499.38</div>
                      <div className="text-xs text-white/80 mt-1">29.14% Business | 72.89% Economy</div>
                    </div>
                  </div>
                  {expandedCard === 'flights' && (
                    <div className="p-3 surface-card text-sm text-slate-700">Flight details: 21 trips this month - click KPI to collapse.</div>
                  )}

                  <div className="surface-card p-4 flex items-center justify-between kpi-card-clickable" onClick={() => toggleExpand('hotels')} role="button" tabIndex={0}>
                    <div>
                      <div className="stat-label text-muted">Hotels</div>
                      <div className="stat-number text-2xl">14</div>
                    </div>
                    <div className="text-right">
                      <div className="stat-number text-base">41 Nights</div>
                      <div className="text-xs text-muted mt-1 uppercase tracking-[0.18em]">Average rating</div>
                      <div className="mt-1 text-amber-400">****</div>
                    </div>
                  </div>
                  {expandedCard === 'hotels' && (
                    <div className="p-3 surface-card text-sm text-slate-700">Hotel breakdown: nightly rates - demo details.</div>
                  )}

                  <div className="surface-card p-4 flex items-center justify-between kpi-card-clickable" onClick={() => toggleExpand('cars')} role="button" tabIndex={0}>
                    <div>
                      <div className="stat-label text-muted">Cars</div>
                      <div className="stat-number text-2xl">8</div>
                    </div>
                    <div className="text-right text-muted">27 Days</div>
                  </div>
                  {expandedCard === 'cars' && (
                    <div className="p-3 surface-card text-sm text-slate-700">Car rentals summary and vendors.</div>
                  )}
                </div>
              </div>
            </section>

            {/* Faux 3D bar chart removed */}

          {/*}  <footer className="mt-6 text-center text-xs text-gray-400">This graph/chart is linked to excel, and changes automatically based on data. Just left click on it and select "Edit Data".</footer>

            {/* Reporting & Analytics Section */}
            <section className="mt-12 max-w-[1160px] mx-auto">
              <h2 className="section-heading text-2xl mb-4">Reporting & Analytics</h2>
              <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-7">
                    {visibleWidgets.includes('tripFrequency') && (
                      <div className="surface-card p-8 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Trip Frequency</h3>
                            <p className="text-sm text-gray-600">Travel patterns over the last 6 months</p>
                          </div>
                        </div>
                        <TripFrequencyBarChart />
                      </div>
                    )}
                  </div>

                  <div className="col-span-5">
                    {visibleWidgets.includes('topDestinations') && (
                      <div className="surface-card p-8 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Top Destinations</h3>
                            <p className="text-sm text-gray-600">Most visited locations</p>
                          </div>
                        </div>
                        <TopDestinationsChart data={[{label:'London', value:32},{label:'New York', value:28},{label:'Tokyo', value:24},{label:'Paris', value:19},{label:'Sydney', value:15}]} />
                      </div>
                    )}
                  </div>
              </div>
            </section>

            {/* Extra row: map and risk feed + widget manager */}
            <section className="mt-8 grid grid-cols-12 gap-6">
              <div className="col-span-8">
                <div className="surface-card p-6">
                    <GlobalMap locations={[
                    { id: 'lon', label: 'London', lat: 51.5074, lng: -0.1278, count: 27, color: DESTINATION_COLORS[0] },
                    { id: 'ny', label: 'New York', lat: 40.7128, lng: -74.0060, count: 24, color: DESTINATION_COLORS[1] },
                    { id: 'tok', label: 'Tokyo', lat: 35.6762, lng: 139.6503, count: 20, color: DESTINATION_COLORS[2] },
                    { id: 'par', label: 'Paris', lat: 48.8566, lng: 2.3522, count: 16, color: DESTINATION_COLORS[3] },
                  ]} />
                </div>
              </div>

              <div className="col-span-4 space-y-4">
                <div className="surface-card p-4">
                  <WidgetManager initial={visibleWidgets} onChange={(w) => setVisibleWidgets(w)} />
                </div>

                <div className="surface-card p-4">
                  {visibleWidgets.includes('riskFeed') && <RiskFeed />}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

// Trip Frequency Bar Chart Component
function TripFrequencyBarChart() {
  const data = [
    { month: 'Apr', count: 12 },
    { month: 'May', count: 18 },
    { month: 'Jun', count: 22 },
    { month: 'Jul', count: 15 },
    { month: 'Aug', count: 27 },
    { month: 'Sep', count: 19 },
  ];
  const max = Math.max(...data.map(d => d.count));
  
  return (
    <div className="space-y-6">
      {data.map((d, index) => {
        const percentage = (d.count / max) * 100;
        const isHighest = d.count === max;
        
        return (
          <div key={d.month} className="group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-16 text-sm font-semibold text-gray-700">{d.month}</div>
                <div className="text-2xl font-bold text-gray-900">{d.count}</div>
                <div className="text-sm text-gray-500">trips</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-600">
                  {percentage.toFixed(0)}%
                </div>
                {isHighest && (
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="relative bg-gray-100 rounded-full h-8 overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isHighest 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}
                style={{ 
                  width: `${percentage}%`,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// DynamicPieChart and Faux3DBarChart helpers
function DynamicPieChart({ data = [], colors = [], onSliceClick, size = 320 }) {
  const palette = colors.length ? colors : ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#c084fc', '#60a5fa'];
  const total = (data || []).reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  const radius = Math.max(26, Math.floor(size / 2 - 36));
  const thickness = Math.max(14, Math.floor(size * 0.14));
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const [hoverIndex, setHoverIndex] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  const [tooltip, setTooltip] = React.useState({ visible: false, x: 0, y: 0, text: '' });
  const wrapRef = React.useRef(null);

  const segments = React.useMemo(() => {
    let accumulator = 0;
    return (data || []).map((item, index) => {
      const value = item.value || 0;
      const portion = value / total;
      const dash = Math.max(0.0001, portion * circumference);
      const segment = {
        index,
        value,
        portion,
        dash,
        offset: -accumulator,
        color: palette[index % palette.length],
        item,
      };
      accumulator += dash;
      return segment;
    });
  }, [data, total, circumference, palette]);

  const centerValue = selectedIndex !== null ? data[selectedIndex].value : total;
  const centerLabel = selectedIndex !== null ? data[selectedIndex].name : 'Total';

  const focusIndex = hoverIndex ?? selectedIndex ?? null;

  function handleSliceFocus(i, event) {
    setHoverIndex(i);
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const item = data[i];
    if (!item) return;
    const pct = ((item.value || 0) / total) * 100;
    setTooltip({ visible: true, x, y, text: `${item.name}: ${item.value} (${pct.toFixed(1)}%)` });
  }

  function clearHover() {
    setHoverIndex(null);
    setTooltip({ visible: false, x: 0, y: 0, text: '' });
  }

  function handleKeyDown(e) {
    if (!segments.length) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setHoverIndex((prev) => {
        const next = prev === null ? 0 : (prev + 1) % segments.length;
        return next;
      });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setHoverIndex((prev) => {
        const next = prev === null ? segments.length - 1 : (prev - 1 + segments.length) % segments.length;
        return next;
      });
    } else if ((e.key === 'Enter' || e.key === ' ') && hoverIndex !== null) {
      e.preventDefault();
      setSelectedIndex(hoverIndex);
      onSliceClick && onSliceClick(data[hoverIndex], hoverIndex);
    }
  }

  return (
    <div
      ref={wrapRef}
      className="pie-wrap"
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Travel spend donut chart"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden={false}>
        <defs>
          <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(15,23,42,0.18)"/>
          </filter>
          {segments.map((segment) => (
            <linearGradient key={segment.index} id={`grad-${segment.index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={segment.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={segment.color} stopOpacity="0.65" />
            </linearGradient>
          ))}
        </defs>
        <g filter="url(#pieShadow)">
          <g transform={`translate(${cx},${cy}) rotate(-90)`}>
            {segments.map((segment) => {
              const { index, dash, offset, item } = segment;
              const isHover = focusIndex === index;
              const explode = isHover ? 12 : selectedIndex === index ? 6 : 0;
              const midAngle = (offset / circumference) * 360 + (dash / circumference) * 180;
              const rad = (midAngle * Math.PI) / 180;
              const dx = Math.cos(rad) * explode;
              const dy = Math.sin(rad) * explode;
              return (
                <g key={index} transform={`translate(${dx},${dy})`} style={{ transition: 'transform 220ms cubic-bezier(.22,.9,.3,1)' }}>
                  <circle
                    r={radius}
                    fill="none"
                    stroke={`url(#grad-${index})`}
                    strokeWidth={thickness}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'stroke-width 160ms ease' }}
                    onMouseEnter={(event) => handleSliceFocus(index, event)}
                    onMouseMove={(event) => handleSliceFocus(index, event)}
                    onMouseLeave={clearHover}
                    onFocus={(event) => handleSliceFocus(index, event)}
                    onBlur={clearHover}
                    onClick={() => { setSelectedIndex(index); onSliceClick && onSliceClick(item, index); }}
                    aria-label={`${item.name}: ${item.value}`}
                  />
                </g>
              );
            })}
          </g>
        </g>
        <circle cx={cx} cy={cy} r={Math.max(10, radius - thickness + 24)} fill="rgba(255,255,255,0.65)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={Math.max(12, Math.floor(size * 0.06))} fill="var(--card-text)" fontWeight={700}>
          {centerValue}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize={Math.max(10, Math.floor(size * 0.035))} fill="var(--muted)">
          {centerLabel}
        </text>
      </svg>
      {tooltip.visible && (
        <div
          className="pie-tooltip"
          style={{ position: 'absolute', left: tooltip.x, top: tooltip.y, pointerEvents: 'none', background: 'rgba(15,23,42,0.88)', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12, whiteSpace: 'nowrap' }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function Faux3DBarChart({ data }){
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="faux-3d-chart" role="list" aria-label="Carbon by destination">
      {data.map((d, i) => {
        const height = `${(d.value / max) * 220}px`;
        return (
          <div key={d.label} className="f3d-bar-wrap" role="listitem" data-showtooltip={false}>
            <div
              className="f3d-bar"
              role="button"
              tabIndex={0}
              aria-label={`${d.label}: ${d.value} metric tons`}
              style={{height}}
            >
              <div className="f3d-bar-top" />
              <div className="f3d-bar-front">{d.value}</div>
            </div>
            <div className="f3d-tooltip" role="status" aria-live="polite">{d.label}: {d.value}</div>
            <div className="f3d-label">{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}

// Top Destinations horizontal bar chart (simple, accessible, static SVG)
function TopDestinationsChart({ data = [] }){
  // reuse DynamicPieChart for consistent look & interactions
  const colors = DESTINATION_COLORS;
  const formatted = (data || []).map(d => ({ name: d.label, value: d.value }));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex-none">
        <DynamicPieChart data={formatted} colors={colors} size={200} />
      </div>
      <div className="w-full">
        <div className="space-y-3">
          {(formatted || []).map((a, i) => {
            const total = formatted.reduce((s, it) => s + (it.value || 0), 0) || 1;
            const pct = Math.round(((a.value || 0) / total) * 100);
            return (
              <button
                key={a.name}
                type="button"
                className="chart-legend-item w-full"
                onClick={() => openChartCard({ title: 'Destination details', item: a, index: i, dataset: formatted, colors })}
              >
                <span className="chart-legend-content">
                  <span className="chart-legend-dot" style={{ background: colors[i % colors.length] }} />
                  <span className="chart-legend-label">{a.name}</span>
                </span>
                <span className="chart-legend-metric">{pct}%</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
