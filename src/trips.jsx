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

  // small form
  function NewTripForm({ onCreate }){
    const [form, setForm] = useState({ requester: '', department: '', destination: '', start: '', end: '', purpose: '', costEstimate: '', riskLevel: 'Low' });

    return (
      <div className="surface-card p-6 mt-4 space-y-4">
        <div className="page-header">
          <h3 className="section-heading text-lg">New trip request</h3>
          <p className="section-subheading text-sm">Capture the essentials to route a request for approval.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder="Requester" value={form.requester} onChange={(e)=> setForm({...form, requester: e.target.value})} />
          <input placeholder="Department" value={form.department} onChange={(e)=> setForm({...form, department: e.target.value})} />
          <input placeholder="Destination" value={form.destination} onChange={(e)=> setForm({...form, destination: e.target.value})} />
          <input type="date" value={form.start} onChange={(e)=> setForm({...form, start: e.target.value})} />
          <input type="date" value={form.end} onChange={(e)=> setForm({...form, end: e.target.value})} />
          <select value={form.riskLevel} onChange={(e)=> setForm({...form, riskLevel: e.target.value})}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input placeholder="Cost estimate" type="number" value={form.costEstimate} onChange={(e)=> setForm({...form, costEstimate: Number(e.target.value)})} />
          <textarea placeholder="Purpose" className="sm:col-span-2" value={form.purpose} onChange={(e)=> setForm({...form, purpose: e.target.value})} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={()=> { onCreate(form); }} className="btn btn-primary">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M10 4v12" strokeLinecap="round" />
              <path d="M4 10h12" strokeLinecap="round" />
            </svg>
            Submit request
          </button>
          <button onClick={()=> setShowForm(false)} className="btn btn-outline">Cancel</button>
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header">
            <h1 className="section-heading text-3xl">Trips management</h1>
            <p className="section-subheading">View, approve, and monitor employee trips.</p>
          </div>

          <div className="page-actions">
            <button onClick={() => navigate(-1)} className="btn btn-outline">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M11 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10h8" strokeLinecap="round" />
              </svg>
              Back
            </button>
            <button onClick={()=> setShowForm(s => !s)} className="btn btn-primary">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M10 4v12" strokeLinecap="round" />
                <path d="M4 10h12" strokeLinecap="round" />
              </svg>
              {showForm ? 'Close form' : 'New trip'}
            </button>
            <button onClick={()=> { localStorage.removeItem(TRIPS_KEY); setTrips(defaultTrips()); }} className="btn btn-outline">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4h12" strokeLinecap="round" />
                <path d="M6 4l1-2h6l1 2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 4l-.6 11.2A1.5 1.5 0 0112.9 16H7.1a1.5 1.5 0 01-1.5-1.4L5 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reset demo
            </button>
          </div>
        </div>

        { showForm && <NewTripForm onCreate={addTrip} /> }

        <div className="mt-4 surface-card p-5">
          <div className="flex gap-2 items-center">
            <select  value={filter.status} onChange={(e)=> setFilter(f => ({...f, status: e.target.value}))}>
              <option value="all">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Department"  value={filter.department} onChange={(e)=> setFilter(f=>({...f, department: e.target.value}))} />
            <input placeholder="Destination"  value={filter.destination} onChange={(e)=> setFilter(f=>({...f, destination: e.target.value}))} />
            <input placeholder="Requester"  value={filter.requester} onChange={(e)=> setFilter(f=>({...f, requester: e.target.value}))} />

            <div className="ml-auto text-sm text-muted">Showing {visible.length} of {trips.length}</div>
          </div>

          <div className="mt-3 grid grid-cols-12 gap-3">
            <div className="col-span-8">
              <ul className="space-y-2">
                {visible.map(t => (
                  <li key={t.id} className="surface-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">{t.requester ? t.requester.charAt(0) : 'U'}</div>
                      <div>
                        <div className="font-medium">{t.requester} <span className="text-xs text-muted uppercase tracking-wider">— {t.department}</span></div>
                        <div className="section-subheading">{t.destination} • {t.start} → {t.end} • ${t.costEstimate}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs ${t.status==='pending'?'bg-yellow-100 text-yellow-800':t.status==='approved'?'bg-green-100 text-green-800':t.status==='rejected'?'bg-red-100 text-red-800':t.status==='active'?'bg-indigo-100 text-indigo-800':'bg-slate-100 text-slate-700'}`}>{t.status}</div>

                      <button onClick={()=> { setSelected(t); }} className="px-3 py-1 bg-white border rounded text-sm">Details</button>
                    </div>
                  </li>
                ))}

                { visible.length === 0 && (
                  <li className="surface-card p-4 text-sm text-muted">No trip requests found</li>
                ) }
              </ul>
            </div>

            <div className="col-span-4">
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="section-heading text-lg">Quick Actions</h3>
                <div className="space-y-2 text-sm mt-3">
                  <button onClick={()=> { const p = visible[0]; if(p){ handleApprove(p.id, 'AutoApprover', 'Bulk approve'); alert('Approved first visible request'); } else alert('No visible trip'); }} className="w-full btn btn-primary">Approve first</button>
                  <button onClick={()=> { const p = visible[0]; if(p){ handleReject(p.id, 'AutoApprover', 'Bulk reject'); alert('Rejected first visible request'); } else alert('No visible trip'); }} className="w-full btn btn-outline text-red-600">Reject first</button>
                  <button onClick={()=> { const stats = trips.reduce((acc,t)=> { acc[t.status] = (acc[t.status]||0)+1; return acc; }, {}); alert('Counts: '+ JSON.stringify(stats)); }} className="w-full btn btn-outline">Stats</button>
                </div>

                <div className="mt-4 text-xs text-muted">Filters are applied to the list. Use Details to manage a request.</div>
              </div>

              <div className="mt-3 surface-card p-4">
                <h3 className="section-heading text-lg">Notifications</h3>
                <div className="section-subheading text-sm">
                  Sent notifications to requesters. Click to open email client.
                </div>
                <div className="mt-2 max-h-40 overflow-auto text-sm space-y-2">
                  { notifications.length === 0 && <div className="text-xs text-muted uppercase tracking-wider">No notifications sent</div> }
                  { notifications.map(n => (
                    <div key={n.id} className="rounded-xl border border-slate-200/70 bg-white/70 p-3 flex items-center justify-between">
                      <div className="truncate">
                        <div className="font-medium">{n.subject}</div>
                        <div className="text-xs text-muted uppercase tracking-wider">to {n.to} • {new Date(n.ts).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <a className="btn btn-outline text-xs" href={`mailto:${n.to}?subject=${encodeURIComponent(n.subject)}&body=${encodeURIComponent(n.body)}`} target="_blank" rel="noreferrer">Open</a>
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

