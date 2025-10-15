import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function uid(){ return Math.random().toString(36).slice(2,9); }

function readLS(key, fallback){ try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }catch{ return fallback; } }
function writeLS(key, v){ try{ localStorage.setItem(key, JSON.stringify(v)); }catch{} }

export default function ExpensePage(){
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(() => readLS('td_employees', [ { id: 'e1', name: 'Alice', budget: 2000 }, { id: 'e2', name: 'Bob', budget: 1500 } ]));
  const [trips, setTrips] = useState(() => readLS('td_trips_v2', []));
  const [expenses, setExpenses] = useState(() => readLS('td_expenses', []));
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [filter, setFilter] = useState({ employee: '', status: 'all' });
  const [newExpense, setNewExpense] = useState({ date: '', employeeId: '', tripId: '', amount: '', category: '', receiptUrl: '' });
  const fileRef = useRef(null);

  useEffect(()=>{ writeLS('td_employees', employees); }, [employees]);
  useEffect(()=>{ writeLS('td_trips_v2', trips); }, [trips]);
  useEffect(()=>{ writeLS('td_expenses', expenses); }, [expenses]);

  // helpers
  function addEmployee(name, budget){ const e = { id: uid(), name, budget: Number(budget)||0 }; setEmployees(s => [e, ...s]); }
  function addTrip(trip){ const t = { id: uid(), ...trip }; setTrips(s => [t, ...s]); }
  function addExpense(){
    const e = { id: uid(), date: newExpense.date || new Date().toISOString().slice(0,10), employeeId: newExpense.employeeId || (employees[0] && employees[0].id) || '', tripId: newExpense.tripId || null, amount: Number(newExpense.amount)||0, category: newExpense.category||'Other', receiptUrl: newExpense.receiptUrl||'', submitted: Boolean(newExpense.receiptUrl), flagged: false };
    setExpenses(s => [e, ...s]);
    setNewExpense({ date:'', employeeId:'', tripId:'', amount:'', category:'', receiptUrl:'' });
  }

  function updateExpense(id, patch){ setExpenses(s => s.map(x => x.id === id ? {...x, ...patch} : x)); }

  function computeEmployeeUtil(employeeId){
    const e = employees.find(x=>x.id===employeeId);
    const budget = e ? Number(e.budget)||0 : 0;
    const spent = expenses.filter(x=>x.employeeId===employeeId).reduce((s,x)=>s + (Number(x.amount)||0), 0);
    return { budget, spent, remaining: budget - spent, pct: budget ? Math.round((spent/budget)*100) : 0 };
  }

  function exportCSV(){
    const rows = [ ['id','date','employee','trip','amount','category','submitted','flagged'] ];
    for(const r of expenses){
      const emp = employees.find(e=>e.id===r.employeeId)?.name || r.employeeId;
      const trip = trips.find(t=>t.id===r.tripId)?.title || r.tripId || '';
      rows.push([r.id, r.date, emp, trip, r.amount, r.category, r.submitted ? 'yes':'no', r.flagged ? 'yes':'no']);
    }
    const csv = rows.map(r=>r.map(c=>`"${(''+c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click(); URL.revokeObjectURL(url);
  }

  function exportPDF(){
    // simple fallback: open print preview of the report area
    window.print();
  }

  // auto-flag overspending or unsubmitted receipts
  useEffect(()=>{
    // flag expenses without receipts older than 14 days
    const threshold = new Date(); threshold.setDate(threshold.getDate() - 14);
    setExpenses(s => s.map(x => ({ ...x, flagged: x.flagged || (!x.submitted && new Date(x.date) < threshold) })))
  }, []);

  // quick variance report
  function varianceReport(){
    const report = employees.map(e => {
      const { budget, spent } = computeEmployeeUtil(e.id);
      return { id: e.id, name: e.name, budget, spent, variance: budget - spent };
    });
    return report;
  }

  const visible = expenses.filter(x => {
    if(filter.employee && x.employeeId !== filter.employee) return false;
    if(filter.status === 'flagged' && !x.flagged) return false;
    if(filter.status === 'unsubmitted' && x.submitted) return false;
    return true;
  });

  return (
    <div className="min-h-screen app-root p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Expense Management</h1>
                    <p className="text-emerald-100 mt-1">Track spend, flag exceptions, and manage reimbursements</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    {employees.length} Employees
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    {expenses.length} Expenses
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    ${expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()} Total
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5l-5 5 5 5" />
                  </svg>
                  Back
                </button>
                <button onClick={exportCSV} className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3v10M6 9l4 4 4-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17h14" />
                  </svg>
                  Export CSV
                </button>
                <button onClick={exportPDF} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Print/PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Enhanced Budgets Section */}
          <div className="col-span-4">
            <div className="surface-card p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Employee Budgets</h2>
                  <p className="text-sm text-gray-600">Track spending against allocated budgets</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {employees.map(emp => {
                  const util = computeEmployeeUtil(emp.id);
                  const isOverBudget = util.remaining < 0;
                  const percentage = util.budget > 0 ? Math.min(100, (util.spent / util.budget) * 100) : 0;
                  
                  return (
                    <div key={emp.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                            <p className="text-sm text-gray-500">Budget: ${emp.budget.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                          ${Math.abs(util.remaining).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Spent: ${util.spent.toLocaleString()}</span>
                          <span className="text-gray-600">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                              percentage > 80 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                              'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                            {isOverBudget ? 'Over budget' : 'Remaining'}
                          </span>
                          <span className="text-gray-500">
                            {util.budget > 0 ? `${percentage.toFixed(0)}% used` : 'No budget set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Add Employee</h4>
                <AddEmployeeForm onAdd={(n,b)=>addEmployee(n,b)} />
              </div>
            </div>
          </div>

          {/* Enhanced Expenses Section */}
          <div className="col-span-8">
            <div className="surface-card p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Expense Tracking</h2>
                    <p className="text-sm text-gray-600">Manage and monitor employee expenses</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={filter.employee} 
                    onChange={e=>setFilter(f=>({...f, employee:e.target.value}))} 
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="">All employees</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                  <select 
                    value={filter.status} 
                    onChange={e=>setFilter(f=>({...f, status:e.target.value}))} 
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="flagged">Flagged</option>
                    <option value="unsubmitted">Unsubmitted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                  {/* Enhanced Add Expense Form */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Add New Expense</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Date</label>
                        <input 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                          type="date" 
                          value={newExpense.date} 
                          onChange={e=>setNewExpense({...newExpense, date:e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Employee</label>
                        <select 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                          value={newExpense.employeeId} 
                          onChange={e=>setNewExpense({...newExpense, employeeId:e.target.value})}
                        >
                          <option value="">Select employee</option>
                          {employees.map(emp=> <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Trip (Optional)</label>
                        <select 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                          value={newExpense.tripId} 
                          onChange={e=>setNewExpense({...newExpense, tripId:e.target.value})}
                        >
                          <option value="">Link to trip (optional)</option>
                          {trips.map(t=> <option key={t.id} value={t.id}>{t.title || t.id}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Amount ($)</label>
                        <input 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                          placeholder="Enter amount" 
                          type="number" 
                          value={newExpense.amount} 
                          onChange={e=>setNewExpense({...newExpense, amount:e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <input 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                          placeholder="e.g., Meals, Transport" 
                          value={newExpense.category} 
                          onChange={e=>setNewExpense({...newExpense, category:e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Receipt URL</label>
                        <input 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                          placeholder="Receipt URL" 
                          value={newExpense.receiptUrl} 
                          onChange={e=>setNewExpense({...newExpense, receiptUrl:e.target.value})} 
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center gap-4">
                      <button 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl" 
                        onClick={addExpense}
                      >
                        Add Expense
                      </button>
                      <label className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                        Upload Receipt
                        <input 
                          type="file" 
                          ref={fileRef} 
                          className="hidden" 
                          onChange={(e)=>{ const f = e.target.files && e.target.files[0]; if(f){ const url = URL.createObjectURL(f); setNewExpense(ne=>({...ne, receiptUrl: url, submitted:true})); } }} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Enhanced Expense List */}
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Expense List</h4>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-auto">
                      {visible.map(x => (
                        <div key={x.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                {employees.find(e=>e.id===x.employeeId)?.name?.charAt(0) || 'E'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-900">${x.amount}</span>
                                  <span className="text-sm text-gray-600">— {x.category}</span>
                                  {x.flagged && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                      Flagged
                                    </span>
                                  )}
                                  {!x.submitted && (
                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">
                                      No Receipt
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {x.date} • {employees.find(e=>e.id===x.employeeId)?.name || 'Unknown'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!x.submitted && (
                                <button 
                                  className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition-all duration-200" 
                                  onClick={()=> updateExpense(x.id, { submitted: true })}
                                >
                                  Mark Submitted
                                </button>
                              )}
                              <button 
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                  x.flagged 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`} 
                                onClick={()=> updateExpense(x.id, { flagged: !x.flagged })}
                              >
                                {x.flagged ? 'Unflag' : 'Flag'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Variance Report */}
                <div className="col-span-1">
                  <div className="surface-card p-6 rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Variance Report</h4>
                        <p className="text-sm text-gray-600">Budget vs actual spending</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {varianceReport().map(r => {
                        const isOverBudget = r.variance < 0;
                        const percentage = r.budget > 0 ? Math.min(100, (r.spent / r.budget) * 100) : 0;
                        
                        return (
                          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  {r.name.charAt(0)}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900">{r.name}</h5>
                                  <p className="text-xs text-gray-500">Budget: ${r.budget.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                                ${Math.abs(r.variance).toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Spent: ${r.spent.toLocaleString()}</span>
                                <span className="text-gray-600">{percentage.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                                    percentage > 80 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                                    'bg-gradient-to-r from-emerald-500 to-teal-500'
                                  }`}
                                  style={{ width: `${Math.min(100, percentage)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className={isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                                  {isOverBudget ? 'Over budget' : 'Under budget'}
                                </span>
                                <span className="text-gray-500">
                                  {r.budget > 0 ? `${percentage.toFixed(0)}% used` : 'No budget set'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddEmployeeForm({ onAdd }){
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Employee Name</label>
          <input 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" 
            placeholder="Enter name" 
            value={name} 
            onChange={e=>setName(e.target.value)} 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Budget ($)</label>
          <input 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" 
            placeholder="Budget" 
            type="number"
            value={budget} 
            onChange={e=>setBudget(e.target.value)} 
          />
        </div>
      </div>
      <button 
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg" 
        onClick={()=>{ if(name) { onAdd(name,budget||0); setName(''); setBudget(''); } }}
      >
        Add Employee
      </button>
    </div>
  )
}
