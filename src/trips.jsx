import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TRIPS_KEY = 'td_trips_v1';
const STATUSES = ['pending', 'approved', 'rejected', 'active', 'completed'];

function generateId(){
  return `trip_${Date.now()}_${Math.floor(Math.random()*9000+1000)}`;
}

function defaultTrips(){
  return [
    {
      id: generateId(),
      requester: 'Alice Johnson',
      requesterEmail: 'alice.johnson@example.com',
      department: 'Sales',
      destination: 'London, UK',
      start: '2025-10-20',
      end: '2025-10-24',
      purpose: 'Client meeting',
      costEstimate: 2800,
      riskLevel: 'Medium',
      status: 'pending',
      attachments: [],
      timeline: [{ts: new Date().toISOString(), status: 'requested', user: 'Alice Johnson'}],
      comments: [],
    },
    {
      id: generateId(),
      requester: 'Bob Smith',
      requesterEmail: 'bob.smith@example.com',
      department: 'Engineering',
      destination: 'San Francisco, USA',
      start: '2025-11-02',
      end: '2025-11-06',
      purpose: 'Conference',
      costEstimate: 4200,
      riskLevel: 'Low',
      status: 'approved',
      attachments: [],
      timeline: [{ts: new Date().toISOString(), status: 'requested', user: 'Bob Smith'},{ts: new Date().toISOString(), status: 'approved', user: 'Manager'}],
      comments: [{by: 'Manager', ts: new Date().toISOString(), text: 'Approved for conference.'}],
    }
  ];
}

export default function Trips(){
  const navigate = useNavigate();
  const [trips, setTrips] = useState(()=>{
    try{ const raw = localStorage.getItem(TRIPS_KEY); if(raw) return JSON.parse(raw); }catch(e){}
    return defaultTrips();
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try{ return localStorage.getItem('currentRole') || 'employee'; }catch{return 'employee'}
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('currentUser')) || { name: currentRole === 'manager' ? 'Manager' : 'User', email: '' }; }catch{return {name:'User', email:''}};
  });

  // notifications log
  const NOTIF_KEY = 'td_notifications';
  const [notifications, setNotifications] = useState(()=>{
    try{ const r = localStorage.getItem(NOTIF_KEY); if(r) return JSON.parse(r); }catch{}; return [];
  });

  useEffect(()=>{
    function onStorage(e){
      if(e.key === 'currentRole') setCurrentRole(e.newValue || 'employee');
      if(e.key === 'currentUser') { try{ setCurrentUser(JSON.parse(e.newValue)); }catch{} }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [filter, setFilter] = useState({ status: 'all', department: '', destination: '', requester: '' });
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef();

  useEffect(()=>{
    try{ localStorage.setItem(TRIPS_KEY, JSON.stringify(trips)); }catch(e){}
  }, [trips]);

  // derived list
  const visible = trips.filter(t => {
    if(filter.status !== 'all' && t.status !== filter.status) return false;
    if(filter.department && !t.department.toLowerCase().includes(filter.department.toLowerCase())) return false;
    if(filter.destination && !t.destination.toLowerCase().includes(filter.destination.toLowerCase())) return false;
    if(filter.requester && !t.requester.toLowerCase().includes(filter.requester.toLowerCase())) return false;
    return true;
  });

  function addTrip(payload){
    const trip = {
      id: generateId(),
      ...payload,
      status: 'pending',
      attachments: [],
      timeline: [{ts: new Date().toISOString(), status: 'requested', user: payload.requester || 'requester'}],
      comments: [],
    };
    setTrips(t => [trip, ...t]);
    setShowForm(false);
    setSelected(trip);
  }

  function updateTrip(id, patch){
    setTrips(t => t.map(x => x.id === id ? ({...x, ...patch}) : x));
  }

  function pushTimeline(id, status, user){
    setTrips(t => t.map(x => x.id === id ? ({...x, timeline: [{ts: new Date().toISOString(), status, user}, ...(x.timeline||[])]}) : x));
  }

  function sendNotification(tripId, to, subject, body){
    const n = { id: `notif_${Date.now()}_${Math.floor(Math.random()*9000)}`, tripId, to, subject, body, ts: new Date().toISOString() };
    setNotifications(ns => { const next = [n, ...ns].slice(0,100); try{ localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); }catch{}; return next; });
    // also persist notifications in local storage
    try{ localStorage.setItem(NOTIF_KEY, JSON.stringify([n, ...(JSON.parse(localStorage.getItem(NOTIF_KEY))||[])])); }catch{}
    return n;
  }

  function addComment(id, by, text){
    setTrips(t => t.map(x => x.id === id ? ({...x, comments: [{by, ts: new Date().toISOString(), text}, ...(x.comments||[])]}) : x));
  }

  function handleApprove(id, by='Approver', comment=''){
    // role-based check moved into UI handlers; function still executes approve
    updateTrip(id, { status: 'approved' });
    pushTimeline(id, 'approved', by);
    if(comment) addComment(id, by, comment);
  }

  function handleReject(id, by='Approver', comment=''){
    updateTrip(id, { status: 'rejected' });
    pushTimeline(id, 'rejected', by);
    if(comment) addComment(id, by, comment);
  }

  function handleStart(id){
    updateTrip(id, { status: 'active' });
    pushTimeline(id, 'active', 'System');
  }

  function handleComplete(id){
    updateTrip(id, { status: 'completed' });
    pushTimeline(id, 'completed', 'System');
  }

  function handleAttach(id, files){
    if(!files || files.length===0) return;
    const arr = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type, ts: new Date().toISOString() }));
    setTrips(t => t.map(x => x.id === id ? ({...x, attachments: [...(x.attachments||[]), ...arr]}) : x));
  }

  function handleDelete(id){
    if(!confirm('Delete this trip request?')) return;
    setTrips(t => t.filter(x => x.id !== id));
    if(selected && selected.id === id) setSelected(null);
  }

  // Enhanced form
  function NewTripForm({ onCreate }){
    const [form, setForm] = useState({ requester: '', department: '', destination: '', start: '', end: '', purpose: '', costEstimate: '', riskLevel: 'Low' });

    return (
      <div className="surface-card p-8 mt-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">New Trip Request</h3>
            <p className="text-sm text-gray-600">Capture the essentials to route a request for approval</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Requester</label>
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              placeholder="Enter requester name" 
              value={form.requester} 
              onChange={(e)=> setForm({...form, requester: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Department</label>
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              placeholder="Enter department" 
              value={form.department} 
              onChange={(e)=> setForm({...form, department: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Destination</label>
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              placeholder="Enter destination" 
              value={form.destination} 
              onChange={(e)=> setForm({...form, destination: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Start Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              value={form.start} 
              onChange={(e)=> setForm({...form, start: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">End Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              value={form.end} 
              onChange={(e)=> setForm({...form, end: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Risk Level</label>
            <select 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              value={form.riskLevel} 
              onChange={(e)=> setForm({...form, riskLevel: e.target.value})}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Cost Estimate ($)</label>
            <input 
              placeholder="Enter cost estimate" 
              type="number" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              value={form.costEstimate} 
              onChange={(e)=> setForm({...form, costEstimate: Number(e.target.value)})} 
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Purpose</label>
            <textarea 
              placeholder="Describe the purpose of the trip" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" 
              rows="3"
              value={form.purpose} 
              onChange={(e)=> setForm({...form, purpose: e.target.value})} 
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          <button 
            onClick={()=> { onCreate(form); }} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 4v12" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h12" />
            </svg>
            Submit Request
          </button>
          <button 
            onClick={()=> setShowForm(false)} 
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function TripDetails({ trip, onClose }){
    const [comment, setComment] = useState('');
    const [approverName, setApproverName] = useState('Manager');
    const [notify, setNotify] = useState(true);

    if(!trip) return null;
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
        <div className="surface-card w-full max-w-3xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="section-heading text-xl">Trip details - {trip.destination}</h3>
              <div className="text-xs text-muted uppercase tracking-wider">Requested by {trip.requester} - {trip.department}</div>
            </div>
            <div className="text-right space-y-2">
              <span className="badge-soft inline-flex justify-end" data-tone={trip.status === 'approved' ? 'emerald' : trip.status === 'pending' ? 'amber' : undefined}>{trip.status}</span>
              <div className="text-xs text-muted uppercase tracking-wider">Cost est: ${trip.costEstimate}</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider">Dates</div>
              <div className="font-medium">{trip.start} to {trip.end}</div>

              <div className="mt-3 text-xs text-muted">Purpose</div>
              <div className="mt-1">{trip.purpose}</div>

              <div className="mt-3 text-xs text-muted">Risk level</div>
              <span className="badge-soft mt-1 inline-flex" data-tone={trip.riskLevel === 'High' ? 'amber' : trip.riskLevel === 'Low' ? 'emerald' : undefined}>{trip.riskLevel}</span>

              <div className="mt-3 text-xs text-muted">Attachments</div>
              <div className="mt-1 space-y-1">
                { (trip.attachments||[]).length === 0 && <div className="text-xs text-muted uppercase tracking-wider">No attachments</div> }
                { (trip.attachments||[]).map((a,i)=> (
                  <div key={i} className="text-sm flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2">
                    <div className="truncate mr-2">{a.name} <span className="text-xs text-muted uppercase tracking-wider">({Math.round(a.size/1024)} KB)</span></div>
                    <div className="flex gap-2">
                      <button onClick={()=> alert('Download simulated in demo') } className="btn btn-outline text-xs">Download</button>
                    </div>
                  </div>
                ))}

                <div className="mt-2 flex items-center gap-2">
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e)=> { handleAttach(trip.id, e.target.files); e.target.value=null; }} />
                  <button onClick={()=> fileInputRef.current && fileInputRef.current.click()} className="btn btn-outline">Attach files</button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted uppercase tracking-wider">Timeline</div>
              <div className="mt-2 space-y-2 max-h-64 overflow-auto text-sm">
                { (trip.timeline||[]).map((s,i)=> (
                  <div key={i} className="rounded-xl border border-slate-200/70 bg-white/70 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider">{new Date(s.ts).toLocaleString()}</div>
                      <div className="font-medium">{s.status}</div>
                      <div className="text-xs text-muted uppercase tracking-wider">by {s.user}</div>
                    </div>
                    <div className="text-xs text-muted uppercase tracking-wider">{i === 0 ? 'latest' : ''}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <div className="text-xs text-muted uppercase tracking-wider">Comments</div>
                <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                  { (trip.comments||[]).length === 0 && <div className="text-xs text-muted uppercase tracking-wider">No comments</div> }
                  { (trip.comments||[]).map((c,i)=> (
                    <div key={i} className="rounded-xl border border-slate-200/70 bg-white/70 p-3 text-sm">
                      <div className="text-xs text-muted uppercase tracking-wider">{c.by} - {new Date(c.ts).toLocaleString()}</div>
                      <div className="mt-1">{c.text}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex gap-2">
                  <input placeholder="Your name" value={approverName} onChange={(e)=> setApproverName(e.target.value)}  />
                </div>

                <div className="mt-2 flex gap-2">
                  <input placeholder="Add a comment (optional)" className="flex-1" value={comment} onChange={(e)=> setComment(e.target.value)} />
                </div>

                <div className="mt-3 flex gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={notify} onChange={(e)=> setNotify(e.target.checked)} /> Notify requester</label>

                  { trip.status === 'pending' && (
                    <>
                      <button onClick={()=> {
                        // role check
                        if(!(currentRole === 'manager' || currentRole === 'finance')){ alert('Only managers or finance can approve requests.'); return; }
                        handleApprove(trip.id, approverName || currentUser?.name || 'Approver', comment);
                        if(notify && trip.requesterEmail){ sendNotification(trip.id, trip.requesterEmail, `Your trip request to ${trip.destination} is approved`, `Hi ${trip.requester},\n\nYour trip to ${trip.destination} (${trip.start} to ${trip.end}) has been approved.\n\nComments: ${comment || '-'}\n\nRegards`); }
                        setComment('');
                      }} className="btn btn-primary">Approve</button>

                      <button onClick={()=> {
                        if(!(currentRole === 'manager' || currentRole === 'finance')){ alert('Only managers or finance can reject requests.'); return; }
                        const reason = comment || prompt('Reason for rejection');
                        if(reason!==null) {
                          handleReject(trip.id, approverName || currentUser?.name || 'Approver', reason);
                          if(notify && trip.requesterEmail){ sendNotification(trip.id, trip.requesterEmail, `Your trip request to ${trip.destination} was rejected`, `Hi ${trip.requester},\n\nYour trip to ${trip.destination} (${trip.start} to ${trip.end}) has been rejected.\n\nReason: ${reason}\n\nRegards`); }
                        }
                        setComment('');
                      }} className="btn btn-outline text-red-600">Reject</button>
                    </>
                  )}

                  { trip.status === 'approved' && (
                    <>
                      <button onClick={()=> handleStart(trip.id)} className="btn btn-primary">Mark Active</button>
                      <button onClick={()=> { if(!(currentRole === 'manager' || currentRole === 'finance')){ alert('Only managers or finance can reject requests.'); return; } handleReject(trip.id, approverName || currentUser?.name || 'Approver', comment || 'Withdrawn by approver'); if(notify && trip.requesterEmail){ sendNotification(trip.id, trip.requesterEmail, `Your trip request to ${trip.destination} was rejected`, `Hi ${trip.requester},\n\nYour trip to ${trip.destination} (${trip.start} to ${trip.end}) has been rejected.\n\nReason: ${comment || '-'}\n\nRegards`); } setComment(''); }} className="btn btn-outline text-red-600">Reject</button>
                    </>
                  )}

                  { trip.status === 'active' && (
                    <button onClick={()=> handleComplete(trip.id)} className="btn btn-primary">Complete</button>
                  )}

                  <button onClick={()=> onClose()} className="btn btn-outline">Close</button>
                  <button onClick={()=> handleDelete(trip.id)} className="btn btn-outline text-red-600">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-root p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Trip Management</h1>
                    <p className="text-blue-100 mt-1">View, approve, and monitor employee travel requests</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    {trips.length} Total Trips
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    {trips.filter(t => t.status === 'pending').length} Pending
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
                    {trips.filter(t => t.status === 'active').length} Active
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5l-5 5 5 5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 10h8" />
                  </svg>
                  Back
                </button>
                <button onClick={()=> setShowForm(s => !s)} className="bg-white text-blue-600 hover:bg-blue-50 rounded-lg px-4 py-2 flex items-center gap-2 font-semibold transition-all duration-200 shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 4v12" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h12" />
                  </svg>
                  {showForm ? 'Close Form' : 'New Trip'}
                </button>
                <button onClick={()=> { localStorage.removeItem(TRIPS_KEY); setTrips(defaultTrips()); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h12" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4l1-2h6l1 2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 4l-.6 11.2A1.5 1.5 0 0112.9 16H7.1a1.5 1.5 0 01-1.5-1.4L5 4" />
                  </svg>
                  Reset Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        { showForm && <NewTripForm onCreate={addTrip} /> }

        <div className="mt-6 surface-card p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Trip Requests</h3>
                <p className="text-sm text-gray-600">Manage and track employee travel requests</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              Showing {visible.length} of {trips.length}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={filter.status} 
                onChange={(e)=> setFilter(f => ({...f, status: e.target.value}))}
              >
                <option value="all">All statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Department</label>
              <input 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="Filter by department" 
                value={filter.department} 
                onChange={(e)=> setFilter(f=>({...f, department: e.target.value}))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Destination</label>
              <input 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="Filter by destination" 
                value={filter.destination} 
                onChange={(e)=> setFilter(f=>({...f, destination: e.target.value}))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Requester</label>
              <input 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="Filter by requester" 
                value={filter.requester} 
                onChange={(e)=> setFilter(f=>({...f, requester: e.target.value}))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
              <div className="space-y-4">
                {visible.map(t => (
                  <div key={t.id} className="surface-card p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg">
                          {t.requester ? t.requester.charAt(0) : 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{t.requester}</h4>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{t.department}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {t.destination}
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              {t.start} → {t.end}
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                              </svg>
                              ${t.costEstimate}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.status==='pending'?'bg-amber-100 text-amber-800 border border-amber-200':
                          t.status==='approved'?'bg-emerald-100 text-emerald-800 border border-emerald-200':
                          t.status==='rejected'?'bg-red-100 text-red-800 border border-red-200':
                          t.status==='active'?'bg-blue-100 text-blue-800 border border-blue-200':
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {t.status}
                        </div>
                        <button 
                          onClick={()=> { setSelected(t); }} 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                { visible.length === 0 && (
                  <div className="surface-card p-12 text-center rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No trip requests found</h3>
                    <p className="text-gray-600">Try adjusting your filters or create a new trip request</p>
                  </div>
                ) }
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              {/* Quick Actions */}
              <div className="surface-card p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-600">Bulk operations and utilities</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={()=> { const p = visible[0]; if(p){ handleApprove(p.id, 'AutoApprover', 'Bulk approve'); alert('Approved first visible request'); } else alert('No visible trip'); }} 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Approve First
                  </button>
                  <button 
                    onClick={()=> { const p = visible[0]; if(p){ handleReject(p.id, 'AutoApprover', 'Bulk reject'); alert('Rejected first visible request'); } else alert('No visible trip'); }} 
                    className="w-full bg-red-100 text-red-700 px-4 py-3 rounded-lg font-semibold hover:bg-red-200 transition-all duration-200 border border-red-200"
                  >
                    Reject First
                  </button>
                  <button 
                    onClick={()=> { const stats = trips.reduce((acc,t)=> { acc[t.status] = (acc[t.status]||0)+1; return acc; }, {}); alert('Counts: '+ JSON.stringify(stats)); }} 
                    className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                  >
                    View Statistics
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">Filters are applied to the list. Use Details to manage a request.</p>
                </div>
              </div>

              {/* Notifications */}
              <div className="surface-card p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7l-5.172 5.172a2 2 0 01-2.828 0L1.414 7l2.586-2.586a2 2 0 012.828 0L12 7l-5.172-5.172a2 2 0 00-2.828 0L1.414 7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-600">Sent notifications to requesters</p>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-auto space-y-3">
                  { notifications.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7l-5.172 5.172a2 2 0 01-2.828 0L1.414 7l2.586-2.586a2 2 0 012.828 0L12 7l-5.172-5.172a2 2 0 00-2.828 0L1.414 7z"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No notifications sent</p>
                    </div>
                  ) }
                  { notifications.map(n => (
                    <div key={n.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{n.subject}</h4>
                          <p className="text-xs text-gray-500 mb-2">to {n.to}</p>
                          <p className="text-xs text-gray-400">{new Date(n.ts).toLocaleString()}</p>
                        </div>
                        <a 
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-all duration-200" 
                          href={`mailto:${n.to}?subject=${encodeURIComponent(n.subject)}&body=${encodeURIComponent(n.body)}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        { selected && <TripDetails trip={selected} onClose={()=> setSelected(null)} /> }
      </div>
    </div>
  );
}

