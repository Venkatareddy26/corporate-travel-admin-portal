import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Plane,
  Shield,
  DollarSign,
  FolderOpen,
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Clock,
  Bell,
  ChevronRight,
  Settings,
  LogOut,
  Target,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  PieChart,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import ThemeToggle from './theme-toggle';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'policy', label: 'Policy Builder', icon: FileText, path: '/policy' },
  { id: 'trips', label: 'Trips', icon: Plane, path: '/trips' },
  { id: 'risk', label: 'Risk Management', icon: Shield, path: '/risk' },
  { id: 'expense', label: 'Expense', icon: DollarSign, path: '/expense' },
  { id: 'documents', label: 'Documents', icon: FolderOpen, path: '/documents' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' }
];

const SUMMARY_CARDS = [
  { title: 'Total Spend', value: '$12,586', change: '+12.5%', icon: DollarSign, accent: 'from-purple-500 to-indigo-500' },
  { title: 'Trips This Month', value: '44', change: '+8.3%', icon: Plane, accent: 'from-blue-500 to-sky-500' },
  { title: 'Active Travelers', value: '24', change: '+3.1%', icon: Users, accent: 'from-emerald-500 to-teal-500' },
  { title: 'Risk Alerts', value: '5', change: '-2.0%', icon: Shield, accent: 'from-amber-500 to-orange-500' }
];

const SPENDING_BREAKDOWN = [
  { label: 'Airfare', bookings: 21, value: '$5.0k', percent: 62 },
  { label: 'Hotels', bookings: 33, value: '$6.0k', percent: 78 },
  { label: 'Car Rentals', bookings: 15, value: '$3.0k', percent: 54 }
];

const DESTINATIONS = [
  { rank: 1, name: 'London', trips: 12, percent: 27 },
  { rank: 2, name: 'New York', trips: 10, percent: 23 },
  { rank: 3, name: 'Tokyo', trips: 8, percent: 18 },
  { rank: 4, name: 'Paris', trips: 7, percent: 16 },
  { rank: 5, name: 'Sydney', trips: 7, percent: 16 }
];

const UPCOMING_TRIPS = [
  { traveler: 'Alice Johnson', destination: 'London, UK', dates: 'Oct 20 - Oct 24', status: 'Approved' },
  { traveler: 'Bob Smith', destination: 'Tokyo, Japan', dates: 'Nov 02 - Nov 06', status: 'Pending' },
  { traveler: 'Carol White', destination: 'New York, USA', dates: 'Oct 25 - Oct 28', status: 'In Progress' }
];

const RISK_ALERTS = [
  { level: 'High', description: 'Severe weather in London', accent: 'text-red-600 bg-red-100' },
  { level: 'Medium', description: 'Transit strike in Tokyo', accent: 'text-yellow-600 bg-yellow-100' },
  { level: 'Low', description: 'Traffic delays in Paris', accent: 'text-green-600 bg-green-100' }
];

const POLICY_SUMMARY = [
  { title: 'Policies Active', value: 12, description: 'Current travel compliance policies', trend: '+2 new this quarter' },
  { title: 'Pending Reviews', value: 3, description: 'Policies awaiting manager approval', trend: 'Review due this week' },
  { title: 'Exceptions', value: 5, description: 'Open exception requests', trend: 'Monitor daily' }
];

const TRIP_PIPELINE = [
  { status: 'Pending', count: 12, accent: 'bg-yellow-500', detail: 'Awaiting manager approval' },
  { status: 'Approved', count: 18, accent: 'bg-green-500', detail: 'Ready for booking' },
  { status: 'Active', count: 8, accent: 'bg-blue-500', detail: 'Travelers on the move' },
  { status: 'Completed', count: 44, accent: 'bg-purple-500', detail: 'Trips closed this month' }
];

const EXPENSE_SUMMARY = [
  { category: 'Meals & Per Diem', amount: '$4,320', receipts: 67 },
  { category: 'Ground Transport', amount: '$2,140', receipts: 38 },
  { category: 'Airfare', amount: '$5,863', receipts: 21 },
  { category: 'Hotels', amount: '$5,772', receipts: 33 }
];

const DOCUMENT_QUEUE = [
  { name: 'Travel Policy 2025.pdf', owner: 'Compliance', status: 'Approved' },
  { name: 'Expense Report Q3.xlsx', owner: 'Finance', status: 'Pending' },
  { name: 'Risk Assessment.docx', owner: 'Security', status: 'Draft' },
  { name: 'Vendor Contract.pdf', owner: 'Procurement', status: 'Review' }
];

const REPORT_SCHEDULE = [
  { name: 'Executive Summary', cadence: 'Weekly', nextRun: 'Oct 18, 09:00', format: 'PDF' },
  { name: 'Expense Analysis', cadence: 'Monthly', nextRun: 'Nov 01, 08:00', format: 'Excel' },
  { name: 'Traveler Insights', cadence: 'Daily', nextRun: 'Tomorrow, 07:30', format: 'CSV' }
];

const ANALYTICS_INSIGHTS = [
  { label: 'Cost Savings', value: '$18,290', change: '+24.1%', note: 'Policy compliance and vendor optimization' },
  { label: 'Policy Compliance', value: '94.2%', change: '-1.2%', note: 'Slight dip vs last period' },
  { label: 'Average Trip Cost', value: '$1,542', change: '+6%', note: 'Increase driven by international routes' }
];

export default function BeautifulDashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <aside
        className={`${collapsed ? 'w-20' : 'w-64'} fixed inset-y-0 left-0 z-40 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 text-white transition-all duration-300 shadow-xl`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold">
              AP
            </div>
            {!collapsed && <span className="text-lg font-semibold">Admin Portal</span>}
          </div>
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden lg:inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`px-5 py-4 border-b border-white/10 ${collapsed ? 'hidden' : 'block'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
              AU
            </div>
            <div>
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-purple-200">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  item.id === 'dashboard' ? 'bg-white text-purple-700 shadow-md' : 'hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`px-4 py-4 border-t border-white/10 ${collapsed ? 'hidden' : 'block'}`}>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-sm rounded-lg hover:bg-white/10">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'} ml-0`}>
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Travel Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, Admin User</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                  <Bell className="w-5 h-5" />
                </button>
                <span className="absolute top-1 right-1 inline-flex w-2 h-2 rounded-full bg-red-500"></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Updates
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="px-6 py-8 space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {SUMMARY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className={`rounded-t-2xl bg-gradient-to-r ${card.accent} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-80">{card.title}</p>
                        <p className="text-3xl font-semibold mt-1">{card.value}</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-3">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Last 30 days</span>
                    <span className={card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>{card.change}</span>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" /> Spending Overview
                  </h2>
                  <p className="text-sm text-gray-500">Last 30 days breakdown</p>
                </div>
              </div>
              <div className="space-y-4">
                {SPENDING_BREAKDOWN.map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.bookings} bookings</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    </div>
                    <div className="mt-3 h-2 bg-white rounded-full">
                      <div
                        className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" /> Top Destinations
                </h2>
              </div>
              <div className="space-y-4">
                {DESTINATIONS.map((dest) => (
                  <div key={dest.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 font-semibold flex items-center justify-center">
                        {dest.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{dest.name}</p>
                        <p className="text-xs text-gray-500">{dest.trips} trips</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{dest.percent}%</p>
                      <div className="mt-2 w-24 h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${dest.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" /> Upcoming Trips
                </h2>
                <button
                  onClick={() => navigate('/trips')}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {UPCOMING_TRIPS.map((trip) => (
                  <div key={trip.traveler} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-semibold flex items-center justify-center">
                        {trip.traveler
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{trip.traveler}</p>
                        <p className="text-sm text-gray-500">{trip.destination}</p>
                        <p className="text-xs text-gray-400 mt-1">{trip.dates}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600">
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-purple-600" /> Risk Alerts
                </h2>
                <div className="space-y-3">
                  {RISK_ALERTS.map((alert) => (
                    <div key={alert.description} className="p-3 rounded-lg border border-gray-100">
                      <p className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${alert.accent}`}>
                        <Shield className="w-3 h-3" /> {alert.level} Risk
                      </p>
                      <p className="text-sm font-medium text-gray-800 mt-2">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white p-6 shadow-lg">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5" /> Quick Actions
                </h2>
                <p className="text-sm text-purple-100 mt-2">Manage your travel operations efficiently</p>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => navigate('/trips')}
                    className="w-full inline-flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm font-medium"
                  >
                    Request new trip
                    <Plane className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/policy')}
                    className="w-full inline-flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm font-medium"
                  >
                    Review policies
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/reports')}
                    className="w-full inline-flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm font-medium"
                  >
                    Generate report
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" /> Policy Highlights
                </h2>
                <button
                  onClick={() => navigate('/policy')}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Manage policies
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {POLICY_SUMMARY.map((item) => (
                  <div key={item.title} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{item.title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-2">{item.value}</p>
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    <p className="text-xs font-medium text-green-600 mt-3">{item.trend}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-purple-600" /> Trip Pipeline
              </h2>
              <div className="space-y-4">
                {TRIP_PIPELINE.map((stage) => (
                  <div key={stage.status} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${stage.accent} text-white font-semibold flex items-center justify-center`}>
                        {stage.count}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{stage.status}</p>
                        <p className="text-xs text-gray-500">{stage.detail}</p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" /> Expense Summary
                </h2>
                <button
                  onClick={() => navigate('/expense')}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View expenses
                </button>
              </div>
              <div className="space-y-4">
                {EXPENSE_SUMMARY.map((item) => (
                  <div key={item.category} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.receipts} receipts</p>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" /> Document Queue
                </h2>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Manage documents
                </button>
              </div>
              <div className="space-y-3">
                {DOCUMENT_QUEUE.map((doc) => (
                  <div key={doc.name} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{doc.name}</p>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-50 text-purple-600">{doc.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Owner: {doc.owner}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" /> Report Schedule
                </h2>
                <button
                  onClick={() => navigate('/reports')}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Manage reports
                </button>
              </div>
              <div className="space-y-4">
                {REPORT_SCHEDULE.map((report) => (
                  <div key={report.name} className="border border-gray-100 rounded-xl p-4">
                    <p className="font-semibold text-gray-900">{report.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>Cadence: {report.cadence}</span>
                      <span>Next run: {report.nextRun}</span>
                      <span className="uppercase">{report.format}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" /> Analytics Insights
              </h2>
              <div className="space-y-4">
                {ANALYTICS_INSIGHTS.map((insight) => (
                  <div key={insight.label} className="bg-white/10 rounded-xl p-4">
                    <p className="text-sm font-semibold text-white/80">{insight.label}</p>
                    <p className="text-2xl font-semibold mt-1">{insight.value}</p>
                    <p className={`text-xs font-medium mt-2 ${insight.change.startsWith('-') ? 'text-orange-200' : 'text-emerald-200'}`}>{insight.change} vs last period</p>
                    <p className="text-xs text-purple-100 mt-2">{insight.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
