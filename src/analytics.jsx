import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Small utilities
function csvDownload(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function jsonDownload(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function htmlPrint(title, html){
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body>${html}</body></html>`);
  w.document.close();
  w.print();
}

// Mock dataset (small)
const MOCK_TRIPS = [
  { id: 't1', employee: 'Alice', dept: 'Sales', region: 'EMEA', destination: 'London', spend: 3200, date: '2025-09-10', status: 'Approved' },
  { id: 't2', employee: 'Bob', dept: 'Engineering', region: 'APAC', destination: 'Tokyo', spend: 4200, date: '2025-09-14', status: 'Pending' },
  { id: 't3', employee: 'Alice', dept: 'Sales', region: 'EMEA', destination: 'Paris', spend: 1200, date: '2025-08-04', status: 'Completed' },
  { id: 't4', employee: 'Carlos', dept: 'Finance', region: 'AMER', destination: 'New York', spend: 5400, date: '2025-07-22', status: 'Approved' },
  { id: 't5', employee: 'Dee', dept: 'Engineering', region: 'APAC', destination: 'Seoul', spend: 900, date: '2025-09-02', status: 'Approved' },
];

const MOCK_EXPENSES = [
  { id:'e1', tripId:'t1', category: 'Airline', vendor: 'Airways', amount: 1200 },
  { id:'e2', tripId:'t1', category: 'Hotel', vendor: 'Grand Inn', amount: 1500 },
  { id:'e3', tripId:'t2', category: 'Airline', vendor: 'NipponAir', amount: 2200 },
  { id:'e4', tripId:'t4', category: 'Hotel', vendor: 'NY Suites', amount: 3000 },
  { id:'e5', tripId:'t5', category: 'Car', vendor: 'RentMe', amount: 200 },
];

const MOCK_INCIDENTS = [
  { id:'i1', date:'2025-09-11', tripId:'t1', severity: 'Low', note: 'Missed connection, rebooked' },
  { id:'i2', date:'2025-09-14', tripId:'t2', severity: 'High', note: 'Medical evacuation' },
];

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export default function Analytics(){
  const [trips] = useState(MOCK_TRIPS);
  const [expenses] = useState(MOCK_EXPENSES);
  const [incidents] = useState(MOCK_INCIDENTS);
  const [deptFilter, setDeptFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  const departments = useMemo(()=>['All', ...Array.from(new Set(trips.map(t=>t.dept)))], [trips]);
  const regions = useMemo(()=>['All', ...Array.from(new Set(trips.map(t=>t.region)))], [trips]);

  const filteredTrips = useMemo(()=> trips.filter(t => (deptFilter==='All' || t.dept===deptFilter) && (regionFilter==='All' || t.region===regionFilter)), [trips, deptFilter, regionFilter]);

  // Travel frequency by employee
  const freqByEmployee = useMemo(()=>{
    const map = {};
    filteredTrips.forEach(t => map[t.employee] = (map[t.employee]||0)+1);
    return Object.entries(map).map(([k,v])=>({ name:k, trips:v }));
  }, [filteredTrips]);

  // Spend breakdown by category
  const spendByCategory = useMemo(()=>{
    const map = {};
    expenses.forEach(e => map[e.category] = (map[e.category]||0) + e.amount);
    return Object.entries(map).map(([k,v])=>({ name:k, value:v }));
  }, [expenses]);

  // Policy compliance (mock: count approved vs pending)
  const compliance = useMemo(()=>{
    const approved = trips.filter(t=>t.status==='Approved').length;
    const pending = trips.filter(t=>t.status==='Pending').length;
    const completed = trips.filter(t=>t.status==='Completed').length;
    return [ { name:'Approved', value:approved }, { name:'Pending', value:pending }, { name:'Completed', value:completed } ];
  }, [trips]);

  // ESG simple CO2 estimate: assume amount roughly proportional
  const co2ByDestination = useMemo(()=>{
    const map = {};
    trips.forEach(t => map[t.destination] = (map[t.destination]||0) + Math.round(t.spend/100));
    return Object.entries(map).map(([k,v])=>({ name:k, value:v }));
  }, [trips]);

  function downloadTripsCSV(){
    const rows = [['id','employee','dept','region','destination','spend','date','status'], ...trips.map(t=>[t.id,t.employee,t.dept,t.region,t.destination,t.spend,t.date,t.status])];
    csvDownload('trips.csv', rows);
  }

  function downloadExpensesCSV(){
    const rows = [['id','tripId','category','vendor','amount'], ...expenses.map(e=>[e.id,e.tripId,e.category,e.vendor,e.amount])];
    csvDownload('expenses.csv', rows);
  }

  function exportPowerBI(){
    // produce a combined JSON snapshot consumable by Power BI / other tools
    jsonDownload('analytics_snapshot.json', { trips, expenses, incidents, generatedAt: new Date().toISOString() });
  }

  function downloadIncidents(){
    const rows = [['id','date','tripId','severity','note'], ...incidents.map(i=>[i.id,i.date,i.tripId,i.severity,i.note])];
    csvDownload('incidents.csv', rows);
  }

  return (
    <div className="app-root space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 opacity-50"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-heading text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="section-subheading mt-3 max-w-2xl text-lg">
                Comprehensive insights across trip volumes, spend analysis, compliance health, ESG metrics, and safety incidents.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <span className="text-sm font-medium text-purple-700">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Enhanced Filters Sidebar */}
        <aside className="col-span-3">
          <div className="surface-card p-6 space-y-6 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                </svg>
              </div>
              <div>
                <h3 className="section-heading text-lg font-semibold">Filters</h3>
                <p className="section-subheading text-sm text-gray-600">Refine analytics by team and geography</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select 
                  value={deptFilter} 
                  onChange={e=> setDeptFilter(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-purple-300"
                >
                  {departments.map(d=> <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select 
                  value={regionFilter} 
                  onChange={e=> setRegionFilter(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-purple-300"
                >
                  {regions.map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Enhanced Export Section */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h4 className="section-heading text-sm font-semibold">Data Exports</h4>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={downloadTripsCSV} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download Trips CSV
                </button>
                <button 
                  onClick={downloadExpensesCSV} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  Download Expenses CSV
                </button>
                <button 
                  onClick={downloadIncidents} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Download Incidents CSV
                </button>
                <button 
                  onClick={exportPowerBI} 
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Export Power BI Snapshot
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main className="col-span-9 space-y-6">
          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="surface-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-700">Total Trips</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{trips.length}</div>
                  <div className="text-sm text-blue-600 mt-1">Active & completed</div>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-20"></div>
                </div>
              </div>
            </div>

            <div className="surface-card p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-emerald-700">Total Spend</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">${expenses.reduce((s,e)=>s+e.amount,0).toLocaleString()}</div>
                  <div className="text-sm text-emerald-600 mt-1">All categories</div>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-20"></div>
                </div>
              </div>
            </div>

            <div className="surface-card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-amber-700">Incidents</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{incidents.length}</div>
                  <div className="text-sm text-amber-600 mt-1">Safety events</div>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full opacity-20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="surface-card p-6 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="section-heading text-lg font-semibold">Travel Frequency</h4>
                  <p className="text-xs text-gray-600">Trips per employee</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={freqByEmployee} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="trips" 
                      fill="url(#purpleGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface-card p-6 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="section-heading text-lg font-semibold">Spend Breakdown</h4>
                  <p className="text-xs text-gray-600">By expense category</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie 
                      data={spendByCategory} 
                      dataKey="value" 
                      nameKey="name" 
                      outerRadius={85} 
                      innerRadius={35}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {spendByCategory.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Enhanced Compliance & ESG Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="surface-card p-5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="section-heading text-base font-semibold">Policy Compliance</h4>
                  <p className="text-xs text-gray-600">Trip approval status</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie 
                      data={compliance} 
                      dataKey="value" 
                      nameKey="name" 
                      outerRadius={65} 
                      innerRadius={20}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {compliance.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface-card p-5 bg-white/80 backdrop-blur-sm border border-green-100 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="section-heading text-base font-semibold">ESG Impact</h4>
                  <p className="text-xs text-gray-600">CO2 by destination (estimate)</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie 
                      data={co2ByDestination} 
                      dataKey="value" 
                      nameKey="name" 
                      outerRadius={65} 
                      innerRadius={20}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {co2ByDestination.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Enhanced Incidents Table */}
          <div className="surface-card p-6 bg-white/80 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg" style={{ marginTop: '2rem' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div>
                <h3 className="section-heading text-lg font-semibold">Risk & Safety Incidents</h3>
                <p className="text-xs text-gray-600">Track and monitor safety events</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Trip</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Severity</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidents.map(i => (
                    <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {i.id}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600">{i.date}</td>
                      <td className="py-3 px-3">
                        <span className="text-sm font-medium text-gray-900">{i.tripId}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          i.severity === 'High' ? 'bg-red-100 text-red-800' :
                          i.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {i.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600">{i.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
