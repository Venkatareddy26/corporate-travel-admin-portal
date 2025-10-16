import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Info, CheckCircle, X, Filter, Search } from 'lucide-react';

export default function AlertsCenter() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('td_alerts') || '[]');
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock alerts for demo
  useEffect(() => {
    if (alerts.length === 0) {
      const mockAlerts = [
        {
          id: 'alert_1',
          type: 'critical',
          category: 'safety',
          title: 'High Risk Alert: London',
          message: 'Severe weather warning issued for London area. 3 travelers affected.',
          timestamp: new Date().toISOString(),
          read: false,
          actionable: true,
          affectedTravelers: 3,
        },
        {
          id: 'alert_2',
          type: 'warning',
          category: 'policy',
          title: 'Policy Compliance Issue',
          message: '5 trip requests pending approval for more than 48 hours.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          actionable: true,
          count: 5,
        },
        {
          id: 'alert_3',
          type: 'info',
          category: 'expense',
          title: 'Budget Alert',
          message: 'Engineering department has used 85% of Q4 travel budget.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          actionable: false,
        },
        {
          id: 'alert_4',
          type: 'success',
          category: 'document',
          title: 'Documents Verified',
          message: 'All travel documents verified for Alice Johnson - Tokyo trip.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          read: true,
          actionable: false,
        },
      ];
      setAlerts(mockAlerts);
      localStorage.setItem('td_alerts', JSON.stringify(mockAlerts));
    }
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      case 'success':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      default:
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    }
  };

  const markAsRead = (id) => {
    const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    setAlerts(updated);
    localStorage.setItem('td_alerts', JSON.stringify(updated));
  };

  const deleteAlert = (id) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    localStorage.setItem('td_alerts', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = alerts.map((a) => ({ ...a, read: true }));
    setAlerts(updated);
    localStorage.setItem('td_alerts', JSON.stringify(updated));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) && !alert.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen app-root p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
                    <p className="text-blue-100 mt-1">Real-time alerts for travel safety, compliance, and operations</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    {alerts.length} Total Alerts
                  </div>
                  {unreadCount > 0 && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium animate-pulse">
                      {unreadCount} Unread
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5l-5 5 5 5" />
                  </svg>
                  Back
                </button>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-lg">
                    Mark All Read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="surface-card p-6 mb-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                All
              </button>
              <button onClick={() => setFilter('critical')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Critical
              </button>
              <button onClick={() => setFilter('warning')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'warning' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Warning
              </button>
              <button onClick={() => setFilter('info')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Info
              </button>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 && (
            <div className="surface-card p-12 text-center rounded-2xl">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No alerts found</h3>
              <p className="text-gray-500">All clear! No alerts match your current filters.</p>
            </div>
          )}

          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`surface-card p-6 rounded-2xl border-2 transition-all duration-200 ${getAlertColor(alert.type)} ${!alert.read ? 'shadow-lg' : 'opacity-75'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                      {!alert.read && <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">NEW</span>}
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{alert.category}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      {alert.affectedTravelers && <span className="text-red-600 font-medium">{alert.affectedTravelers} travelers affected</span>}
                      {alert.count && <span className="text-amber-600 font-medium">{alert.count} items</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!alert.read && (
                    <button onClick={() => markAsRead(alert.id)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                      Mark Read
                    </button>
                  )}
                  {alert.actionable && (
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
                      Take Action
                    </button>
                  )}
                  <button onClick={() => deleteAlert(alert.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
