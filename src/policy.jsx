import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
const LOCAL_KEY = "policy_builder_v1";
const POLICIES_KEY = "policy_builder_v1_list";
const TABS = [
  { id: "guidelines", label: "Guidelines" },
  { id: "safety", label: "Safety" },
  { id: "workflow", label: "Approvals" },
  { id: "notifications", label: "Notifications" },
  { id: "expenses", label: "Expenses" },
  { id: "roles", label: "Roles" },
  { id: "audit", label: "Audit" },
  { id: "templates", label: "Templates" },
];

function IconSave() {
  return (
    <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3h14v14H5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 3v6h10V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 14h6v4H9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeToggle(){
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('siteTheme') || 'light' } catch { return 'light' }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
      localStorage.setItem('siteTheme', theme);
    } catch (e) {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      onClick={toggle}
      className="theme-btn"
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function TabButton({ id, label, active, setActive, index, focusableIndex, setFocusableIndex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (focusableIndex === index) ref.current?.focus();
  }, [focusableIndex, index]);

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={active === id}
      tabIndex={active === id ? 0 : -1}
      onClick={() => setActive(id)}
      onFocus={() => setFocusableIndex(index)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-all flex items-center gap-2 ${
        active === id
          ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}

function CollapsibleCard({ title, description, defaultOpen = true, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div>
          <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            {title}
            {badge && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{badge}</span>}
          </div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="border-t border-gray-100 px-4 py-4">{children}</div>}
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center bg-white">
      <div className="text-sm font-medium text-gray-700">{title}</div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default function policy() {
  const navigate = useNavigate();
  // load from localStorage if exists
  const defaultPolicy = {
    meta: { id: `policy_${Date.now()}`, name: "Default policy", updated: new Date().toISOString() },
    bookingClass: "Economy Only",
    budgetLimit: "",
    preferredAirlines: [],
    preferredHotels: [],
    advanceBookingDays: 14,
    mandatoryInsurance: true,
    highRiskDestinations: [],
    emergencyContacts: "",
    advisoriesUrl: "",
    approvalWorkflows: [
      { id: 1, name: "Default", steps: ["Manager"] },
    ],
    // assignment fields
    department: '',
    region: '',
    assignedGroups: [],
    costCenters: [],
    // risk approval rules
    riskApproval: { mode: 'manual', autoThreshold: '' },
    // versioning
    versions: [],
    notificationChannels: { email: true, sms: false, slack: false },
    notificationEmails: "",
    expenseLimits: { Meals: "", Transport: "", Misc: "" },
    roles: [{ role: "Employee", permissions: ["view"] }],
    templates: [],
    auditLog: [{ ts: new Date().toISOString(), user: "system", msg: "Initial policy created" }],
  };

  const [policy, setPolicy] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : defaultPolicy;
    } catch (e) {
      console.warn("Failed to read local policy, using default", e);
      return defaultPolicy;
    }
  });

  const [policies, setPolicies] = useState(() => {
    try{
      const raw = localStorage.getItem(POLICIES_KEY);
      if(raw) return JSON.parse(raw);
    }catch{}
    return [defaultPolicy];
  });
  const [currentPolicyId, setCurrentPolicyId] = useState(() => policy?.meta?.id || policies[0]?.meta?.id);

  const [activeTab, setActiveTab] = useState("guidelines");
  const [focusableIndex, setFocusableIndex] = useState(0);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [diffsForModal, setDiffsForModal] = useState([]);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() => {
    try {
      return JSON.stringify(policy);
    } catch {
      return "";
    }
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previewRef = useRef(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activateTab = useCallback((id, focusIndex) => {
    setActiveTab(id);
    if (typeof focusIndex === "number") {
      setFocusableIndex(focusIndex);
    }
    setMobileNavOpen(false);
  }, []);

  // keyboard navigation for tabs
  function handleKeyDown(e) {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    if (e.key === "ArrowRight") {
      const next = (currentIndex + 1) % TABS.length;
      activateTab(TABS[next].id, next);
    } else if (e.key === "ArrowLeft") {
      const prev = (currentIndex - 1 + TABS.length) % TABS.length;
      activateTab(TABS[prev].id, prev);
    } else if (e.key === "Home") {
      activateTab(TABS[0].id, 0);
    } else if (e.key === "End") {
      activateTab(TABS[TABS.length - 1].id, TABS.length - 1);
    }
  }

  useEffect(() => {
    // persist short debounce for current policy edit (not whole list)
    const id = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(policy));
      } catch (e) {
        console.warn("Failed to persist policy", e);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [policy]);

  useEffect(() => {
    try {
      const snapshot = JSON.stringify(policy);
      setHasUnsavedChanges(snapshot !== lastSavedSnapshot);
    } catch (e) {
      setHasUnsavedChanges(true);
    }
  }, [policy, lastSavedSnapshot]);

  // ensure policies list contains the current policy on load
  useEffect(() => {
    try{
      setPolicies((prev) => {
        const exists = prev.find(p => p.meta?.id === policy.meta?.id);
        if(!exists){
          const next = [policy, ...prev];
          localStorage.setItem(POLICIES_KEY, JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }catch{}
  }, []);

  // when selecting a different saved policy id, load it into editor
  useEffect(() => {
    if(!currentPolicyId) return;
    const found = policies.find(p => p.meta?.id === currentPolicyId);
    if(found) {
      const next = JSON.parse(JSON.stringify(found));
      setPolicy(next);
      try {
        const snap = JSON.stringify(next);
        setLastSavedSnapshot(snap);
        setHasUnsavedChanges(false);
      } catch {}
    }
  }, [currentPolicyId, policies]);

  function pushAudit(msg, user = "current-user") {
    const entry = { ts: new Date().toISOString(), user, msg };
    setPolicy((p) => ({ ...p, auditLog: [entry, ...(p.auditLog || [])] }));
  }

  function savePolicy() {
    setPolicy((prev) => {
      const timestamp = new Date().toISOString();
      const auditEntry = { ts: timestamp, user: "current-user", msg: "Saved policy" };
      const base = { ...prev, meta: { ...prev.meta, updated: timestamp } };
      let versions = base.versions || [];
      try {
        const snapshot = JSON.parse(JSON.stringify(base));
        snapshot.snapshotAt = timestamp;
        versions = [snapshot, ...versions].slice(0, 20);
      } catch (e) {
        console.warn("Failed to snapshot policy", e);
      }

      const updated = { ...base, versions, auditLog: [auditEntry, ...(base.auditLog || [])] };

      setPolicies((prevPolicies) => {
        const exists = prevPolicies.find((x) => x.meta?.id === updated.meta?.id);
        const next = exists
          ? prevPolicies.map((x) => (x.meta?.id === updated.meta?.id ? updated : x))
          : [updated, ...prevPolicies];
        try {
          localStorage.setItem(POLICIES_KEY, JSON.stringify(next));
        } catch (e) {
          console.warn("Failed to persist policies list", e);
        }
        return next;
      });

      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist policy", e);
      }

      try {
        setLastSavedSnapshot(JSON.stringify(updated));
        setHasUnsavedChanges(false);
      } catch (e) {
        console.warn("Failed to update save snapshot", e);
      }

      alert("Policy saved locally and added to policies list");

      return updated;
    });
  }

  function loadTemplate(template) {
    // merge template onto policy but keep audit
    setPolicy((p) => ({ ...p, ...template, auditLog: p.auditLog }));
    pushAudit(`Loaded template ${template.meta?.name || template.name || "(template)"}`);
  }

  function createNewPolicyFromCurrent(name){
    const copy = JSON.parse(JSON.stringify(policy));
    copy.meta = { ...(copy.meta||{}), id: `policy_${Date.now()}`, name: name || (`Copy of ${copy.meta?.name||'Policy'}`), updated: new Date().toISOString() };
    copy.versions = [];
    setPolicies(prev => { const next = [copy, ...prev]; try{ localStorage.setItem(POLICIES_KEY, JSON.stringify(next)); }catch{}; return next; });
    setCurrentPolicyId(copy.meta.id);
    pushAudit('Created new policy');
  }

  function deletePolicy(id){
    if(!confirm('Delete this policy? This cannot be undone.')) return;
    setPolicies(prev => {
      const next = prev.filter(p => p.meta?.id !== id);
      try{ localStorage.setItem(POLICIES_KEY, JSON.stringify(next)); }catch{}
      if(next.length) setCurrentPolicyId(next[0].meta.id);
      else {
        // reset to default
        setPolicy(defaultPolicy);
        setCurrentPolicyId(defaultPolicy.meta.id);
        setPolicies([defaultPolicy]);
      }
      return next;
    });
    pushAudit('Deleted policy');
  }

  function exportPolicyObject(obj){ exportObjectAsJSON(obj, `${obj.meta?.name||'policy'}.json`); }

  function addExpenseCategory(name) {
    setPolicy((p) => ({ ...p, expenseLimits: { ...p.expenseLimits, [name]: "" } }));
    pushAudit(`Added expense category ${name}`);
  }

  function removeExpenseCategory(name) {
    setPolicy((p) => {
      const copy = { ...p.expenseLimits };
      delete copy[name];
      return { ...p, expenseLimits: copy };
    });
    pushAudit(`Removed expense category ${name}`);
  }

  function addWorkflow(name) {
    setPolicy((p) => ({ ...p, approvalWorkflows: [...(p.approvalWorkflows || []), { id: Date.now(), name, steps: ["Manager"] }] }));
    pushAudit(`Added workflow ${name}`);
  }

  function rollbackAudit(index) {
    const entry = policy.auditLog[index];
    if (!entry) return;
    // For the demo, rollback will append an audit entry describing rollback.
    pushAudit(`Rolled back to entry: ${entry.msg}`);
    alert(`Rolled back (demo): ${entry.msg}`);
  }

  // Quick action handlers
  function handleAddPerDiem() {
    // keep the quick action simple: add a PerDiem category and notify
    addExpenseCategory('PerDiem');
    alert('PerDiem category added');
  }

  function handleAddWorkflow() {
    // add a default-named workflow; user can rename from the Workflows tab
    addWorkflow('New Workflow');
    alert('New workflow added (rename it in Approvals)');
  }

  function resetPolicy() {
    // restore defaults and record audit entry
    setPolicy(defaultPolicy);
    pushAudit('Reset to default');
    alert('Policy reset to defaults');
  }

  const scrollToPreview = () => {
    try {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) {
      console.warn("Preview scroll failed", e);
    }
  };

  function handleQuickCompare() {
    const versions = policy.versions || [];
    if (!versions.length) {
      alert("Save a version before comparing.");
      return;
    }
    const snapshot = versions[0];
    const diffs = computeDiff(snapshot, policy);
    setDiffsForModal(diffs);
    setDiffModalOpen(true);
  }

  function exportPolicy() {
    const blob = new Blob([JSON.stringify(policy, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policy.meta?.name || "policy"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportObjectAsJSON(obj, filename = 'template.json'){
    try{
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){ console.warn('export failed', e); }
  }

  function importPolicy(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setPolicy(parsed);
        pushAudit("Imported policy file");
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  // Template preview helpers
  function openTemplatePreview(tpl){
    setPreviewTemplate(tpl);
  }

  function closeTemplatePreview(){
    setPreviewTemplate(null);
  }

  // close on Escape
  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') closeTemplatePreview(); }
    if(previewTemplate) document.addEventListener('keydown', onKey);
    return ()=> document.removeEventListener('keydown', onKey);
  }, [previewTemplate]);

  // Helpers for UI small components
  function Chip({ children }) {
    return <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">{children}</span>;
  }

  // simple diff utility: returns array of { path, old, new, type }
  function computeDiff(a, b, prefix=''){
    const out = [];
    const keys = new Set([...(a?Object.keys(a):[]), ...(b?Object.keys(b):[])]);
    keys.forEach(k => {
      const pa = a ? a[k] : undefined;
      const pb = b ? b[k] : undefined;
      const path = prefix ? `${prefix}.${k}` : k;
      if(typeof pa === 'object' && pa !== null && typeof pb === 'object' && pb !== null && !Array.isArray(pa) && !Array.isArray(pb)){
        out.push(...computeDiff(pa, pb, path));
      } else if(Array.isArray(pa) && Array.isArray(pb)){
        if(JSON.stringify(pa) !== JSON.stringify(pb)) out.push({ path, old: pa, new: pb, type: 'modified' });
      } else {
        if(JSON.stringify(pa) !== JSON.stringify(pb)) out.push({ path, old: pa, new: pb, type: pa === undefined ? 'added' : pb === undefined ? 'removed' : 'modified' });
      }
    });
    return out;
  }

  // Modal component to show version diffs
  function VersionDiffModal({ open, onClose, diffs, title }){
    if(!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{title || 'Version differences'}</h3>
            <button onClick={onClose} className="text-sm px-2 py-1 bg-gray-100 rounded">Close</button>
          </div>
          <div className="max-h-96 overflow-auto text-sm">
            {(!diffs || diffs.length === 0) && <div className="text-gray-500">No differences found</div>}
            {diffs && diffs.map((d, i) => (
              <div key={i} className="p-2 border-b flex items-start gap-3">
                <div className={`w-2 h-6 rounded ${d.type==='modified' ? 'bg-yellow-400' : d.type==='added' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div>
                  <div className="font-medium">{d.path} <span className="text-xs text-gray-400">({d.type})</span></div>
                  <div className="text-xs text-gray-600">Old: <pre className="inline">{JSON.stringify(d.old)}</pre></div>
                  <div className="text-xs text-gray-800">New: <pre className="inline">{JSON.stringify(d.new)}</pre></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const templateExamples = [
    {
      meta: { name: "Standard Travel", updated: new Date().toISOString() },
      bookingClass: "Economy Only",
      budgetLimit: "1000",
      notificationChannels: { email: true, sms: false, slack: false },
    },
    {
      meta: { name: "Exec Travel", updated: new Date().toISOString() },
      bookingClass: "Business Allowed",
      budgetLimit: "5000",
      notificationChannels: { email: true, sms: true, slack: true },
    },
  ];

  const channelLabels = { email: "Email", sms: "SMS", slack: "Slack" };
  const activeNotificationChannels = Object.entries(policy.notificationChannels || {})
    .filter(([, enabled]) => enabled)
    .map(([channel]) => channelLabels[channel] || channel);
  const primaryApprover = policy.approvalWorkflows?.[0]?.steps?.[0] || "Not assigned";
  const highRiskBadge = (policy.highRiskDestinations || []).length
    ? `${policy.highRiskDestinations.length} high-risk`
    : null;
  const expenseCategories = Object.keys(policy.expenseLimits || {});
  const savedTemplates = policy.templates || [];
  const hasVersionHistory = (policy.versions || []).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto surface-card overflow-hidden">
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div>
            <h1 className="section-heading text-3xl text-gray-900">Corporate Travel Policy Builder</h1>
            <div className="text-sm text-gray-600">Create, preview and manage travel policies</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="xl:hidden px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 font-medium transition"
              aria-expanded={mobileNavOpen}
              aria-controls="policy-nav-panel"
            >
              {mobileNavOpen ? "Close Menu" : "Open Menu"}
            </button>
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <ThemeToggle />
            <button
              onClick={savePolicy}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition"
              title="Save policy (localStorage)"
            >
              <IconSave /> Save
            </button>

            <button
              onClick={exportPolicy}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition"
              title="Export policy as JSON"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17h14" strokeLinecap="round" />
              </svg>
              Export
            </button>

            <label className="cursor-pointer inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13V3M6 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17h14" strokeLinecap="round" />
              </svg>
              Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files && importPolicy(e.target.files[0])}
              />
            </label>
          </div>
        </header>

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 xl:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <div className="relative p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <aside
            id="policy-nav-panel"
            className={`xl:col-span-3 order-2 xl:order-1 ${mobileNavOpen ? "block" : "hidden"} xl:block xl:static ${
              mobileNavOpen ? "absolute left-4 right-4 top-4 z-50" : ""
            }`}
          >
            <div className="bg-gray-50 rounded-lg p-4 xl:sticky xl:top-6 max-h-[80vh] overflow-y-auto">
              <div className="mb-4">Policies</div>
            <div className="mb-3">
              <select className="w-full border rounded p-2" value={currentPolicyId} onChange={(e)=> setCurrentPolicyId(e.target.value)}>
                {policies.map(p => (<option key={p.meta.id} value={p.meta.id}>{p.meta.name}</option>))}
              </select>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 px-2 py-1 bg-white border rounded" onClick={()=> { const name = prompt('New policy name'); if(name) createNewPolicyFromCurrent(name); }}>New</button>
                <button className="px-2 py-1 bg-white border rounded" onClick={()=> createNewPolicyFromCurrent(`${policy.meta?.name || 'Copy'}`)}>Duplicate</button>
                <button className="px-2 py-1 bg-red-50 text-red-600 border rounded" onClick={()=> deletePolicy(policy.meta?.id)}>Delete</button>
              </div>
            </div>
            <div className="mb-4">Tabs (use Left/Right Home End)</div>
            <div role="tablist" aria-label="Policy Tabs" onKeyDown={handleKeyDown} className="flex flex-col gap-2">
              {TABS.map((t, i) => (
                <TabButton key={t.id} id={t.id} label={t.label} active={activeTab} setActive={activateTab} index={i} focusableIndex={focusableIndex} setFocusableIndex={setFocusableIndex} />
              ))}
            </div>

            <div className="mt-6">
              <div className="text-xs text-gray-500 mb-2">Quick actions</div>
              <div className="flex flex-col gap-2">
                <button className="text-sm bg-white px-3 py-2 rounded shadow-sm text-left" onClick={handleAddPerDiem}>
                  <IconPlus /> Add PerDiem category
                </button>
                <button className="text-sm bg-white px-3 py-2 rounded shadow-sm text-left" onClick={handleAddWorkflow}>+ Add Workflow</button>
                <button className="text-sm bg-white px-3 py-2 rounded shadow-sm text-left" onClick={resetPolicy}>
                  Reset
                </button>
              </div>
            </div>
            </div>
          </aside>

          <main className="order-1 xl:order-2 xl:col-span-6 space-y-6">
            <section className="bg-white/90 border border-purple-100 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-purple-500">Active Policy</div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <h2 className="text-xl font-semibold text-gray-900">{policy.meta?.name || "Untitled policy"}</h2>
                    <Chip>{hasUnsavedChanges ? "Draft (unsaved changes)" : "Saved"}</Chip>
                    {highRiskBadge && <Chip>{highRiskBadge}</Chip>}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Last updated&nbsp;
                    {policy.meta?.updated ? new Date(policy.meta.updated).toLocaleString() : "Not saved yet"}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 max-w-xl">
                    Keep policy owners aligned by tracking assignments and approvals at a glance. Use the cards below to
                    fine tune booking rules, safety constraints, and communications.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:min-w-[260px]">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Primary Approver</div>
                    <div className="font-medium text-gray-900">{primaryApprover}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Budget Limit</div>
                    <div className="font-medium text-gray-900">
                      {policy.budgetLimit ? `$${policy.budgetLimit}` : "No limit defined"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Notifications</div>
                    <div className="font-medium text-gray-900">
                      {activeNotificationChannels.length ? activeNotificationChannels.join(", ") : "No channels"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Region Coverage</div>
                    <div className="font-medium text-gray-900">{policy.region || "All regions"}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Panels */}
            <div className="space-y-6">
              {activeTab === "guidelines" && (
                <section className="surface-card p-6 transition-transform transform hover:-translate-y-0.5">
                  <h2 className="text-lg font-semibold mb-4">Travel Guidelines</h2>
                  <div className="space-y-4">
                    <CollapsibleCard
                      title="Trip basics"
                      description="Set default booking class, spending guardrails, and lead time expectations."
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Booking Class
                            <span className="block text-xs font-normal text-gray-500">
                              Choose the standard travel cabin for this policy.
                            </span>
                          </label>
                          <select
                            className="w-full border rounded p-2 mt-1"
                            value={policy.bookingClass}
                            onChange={(e) => setPolicy({ ...policy, bookingClass: e.target.value })}
                          >
                            <option>Economy Only</option>
                            <option>Business Allowed</option>
                            <option>First Class Allowed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Budget Limit (USD)
                            <span className="block text-xs font-normal text-gray-500">
                              Keep it empty if travellers can expense beyond a baseline.
                            </span>
                          </label>
                          <input
                            type="number"
                            className="w-full border rounded p-2 mt-1"
                            value={policy.budgetLimit}
                            onChange={(e) => setPolicy({ ...policy, budgetLimit: e.target.value })}
                            placeholder="Example: 1500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Advance Booking Rule (days)
                            <span className="block text-xs font-normal text-gray-500">
                              Encourage early planning to unlock better fares.
                            </span>
                          </label>
                          <input
                            type="number"
                            className="w-full border rounded p-2 mt-1"
                            value={policy.advanceBookingDays}
                            onChange={(e) => setPolicy({ ...policy, advanceBookingDays: Number(e.target.value) })}
                            min={0}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Policy Name
                            <span className="block text-xs font-normal text-gray-500">
                              Use a descriptive title, e.g. "EMEA Sales Travel 2024".
                            </span>
                          </label>
                          <input
                            className="w-full border rounded p-2 mt-1"
                            value={policy.meta?.name || ""}
                            onChange={(e) =>
                              setPolicy({ ...policy, meta: { ...(policy.meta || {}), name: e.target.value } })
                            }
                            placeholder="Name your policy"
                          />
                        </div>
                      </div>
                    </CollapsibleCard>

                    <CollapsibleCard
                      title="Preferred suppliers"
                      description="Highlight suppliers that keep costs predictable and compliant."
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Preferred Airlines
                            <span className="block text-xs font-normal text-gray-500">
                              Comma separated list. Travellers will see these first.
                            </span>
                          </label>
                          <input
                            className="w-full border rounded p-2 mt-1"
                            value={policy.preferredAirlines.join(",")}
                            onChange={(e) =>
                              setPolicy({
                                ...policy,
                                preferredAirlines: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            placeholder="e.g. Delta, Lufthansa, Singapore Airlines"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Preferred Hotels
                            <span className="block text-xs font-normal text-gray-500">
                              Comma separated list. Ideal for negotiated rates.
                            </span>
                          </label>
                          <input
                            className="w-full border rounded p-2 mt-1"
                            value={policy.preferredHotels.join(",")}
                            onChange={(e) =>
                              setPolicy({
                                ...policy,
                                preferredHotels: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            placeholder="e.g. Marriott, Hyatt"
                          />
                        </div>
                      </div>
                    </CollapsibleCard>

                    <CollapsibleCard
                      title="Assignments & eligibility"
                      description="Target who can use this policy to prevent accidental bookings."
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Department
                            <span className="block text-xs font-normal text-gray-500">
                              Hint: add multiple policies per department where needed.
                            </span>
                          </label>
                          <input
                            className="w-full border rounded p-2 mt-1"
                            value={policy.department || ""}
                            onChange={(e) => setPolicy({ ...policy, department: e.target.value })}
                            placeholder="e.g. Sales, Engineering"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700">
                            Primary Region
                            <span className="block text-xs font-normal text-gray-500">
                              Helps surface local advisories and currency defaults.
                            </span>
                          </label>
                          <input
                            className="w-full border rounded p-2 mt-1"
                            value={policy.region || ""}
                            onChange={(e) => setPolicy({ ...policy, region: e.target.value })}
                            placeholder="e.g. EMEA, APAC"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Assigned Groups
                            <span className="block text-xs font-normal text-gray-500">
                              Comma separated. Helpful for pilot groups or cost-aware cohorts.
                            </span>
                          </label>
                          <input
                            className="w-full border rounded p-2 mt-1"
                            value={(policy.assignedGroups || []).join(",")}
                            onChange={(e) =>
                              setPolicy({
                                ...policy,
                                assignedGroups: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            placeholder="e.g. Field Engineers, SDR Team"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Cost Centers
                            <span className="block text-xs font-normal text-gray-500">
                              Match finance reporting codes to keep expenses reconciled.
                            </span>
                          </label>
                          <input
                            className="w-full border rounded p-2 mt-1"
                            value={(policy.costCenters || []).join(",")}
                            onChange={(e) =>
                              setPolicy({
                                ...policy,
                                costCenters: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            placeholder="e.g. CC1001, CC2002"
                          />
                        </div>
                      </div>
                    </CollapsibleCard>

                    <CollapsibleCard
                      title="Risk rules"
                      description="Flag risky trips for manual review or automate approvals based on spend."
                      badge={policy.riskApproval?.mode === "auto" ? "Auto" : "Manual"}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-4 items-center">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                              type="radio"
                              name="risk-mode"
                              checked={(policy.riskApproval?.mode || "manual") === "manual"}
                              onChange={() =>
                                setPolicy((p) => ({ ...p, riskApproval: { ...(p.riskApproval || {}), mode: "manual" } }))
                              }
                            />
                            Manual review
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                              type="radio"
                              name="risk-mode"
                              checked={(policy.riskApproval?.mode || "") === "auto"}
                              onChange={() =>
                                setPolicy((p) => ({ ...p, riskApproval: { ...(p.riskApproval || {}), mode: "auto" } }))
                              }
                            />
                            Auto-approve
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                          <input
                            className="border rounded p-2 w-40"
                            placeholder="Auto threshold"
                            value={policy.riskApproval?.autoThreshold || ""}
                            onChange={(e) =>
                              setPolicy((p) => ({
                                ...p,
                                riskApproval: { ...(p.riskApproval || {}), autoThreshold: e.target.value },
                              }))
                            }
                          />
                          <span className="text-xs text-gray-500">
                            Example: auto-approve trips under $500 or domestic routes only.
                          </span>
                        </div>
                      </div>
                    </CollapsibleCard>
                  </div>
                </section>
              )}

              {activeTab === "safety" && (
                <section className="surface-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Safety Rules</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 text-xs text-gray-500">
                      Create safeguards for risky destinations and keep teams aligned in case of emergencies.
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={policy.mandatoryInsurance} onChange={(e) => setPolicy({ ...policy, mandatoryInsurance: e.target.checked })} />
                      <span className="text-sm font-medium text-gray-700">Mandatory Insurance</span>
                    </label>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        High-risk Destinations
                        <span className="block text-xs text-gray-500 font-normal">Comma separated list for extra approvals.</span>
                      </label>
                      <input className="w-full border rounded p-2 mt-1" value={policy.highRiskDestinations.join(",")} onChange={(e) => setPolicy({ ...policy, highRiskDestinations: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })} placeholder="e.g. Kabul, Kyiv" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Emergency Contacts
                        <span className="block text-xs text-gray-500 font-normal">Provide phone numbers or hotlines travellers can reach 24/7.</span>
                      </label>
                      <textarea className="w-full border rounded p-2 mt-1" rows={3} value={policy.emergencyContacts} onChange={(e) => setPolicy({ ...policy, emergencyContacts: e.target.value })} />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Travel Advisories Feed URL
                        <span className="block text-xs text-gray-500 font-normal">Link to government or insurance advisories to surface live alerts.</span>
                      </label>
                      <input className="w-full border rounded p-2 mt-1" value={policy.advisoriesUrl} onChange={(e) => setPolicy({ ...policy, advisoriesUrl: e.target.value })} placeholder="https://travel.state.gov/..." />
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "workflow" && (
                <section className="surface-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Approval Workflows</h2>
                  <div className="space-y-3">
                    {(!policy.approvalWorkflows || policy.approvalWorkflows.length === 0) && (
                      <EmptyState
                        title="No workflows yet"
                        description="Set up at least one approval path to keep requests compliant."
                        action={
                          <button
                            onClick={handleAddWorkflow}
                            className="px-3 py-2 bg-purple-700 text-white rounded text-sm shadow-sm"
                          >
                            Add first workflow
                          </button>
                        }
                      />
                    )}
                    {policy.approvalWorkflows.map((wf) => {
                      const steps = Array.isArray(wf.steps) ? wf.steps : [];
                      return (
                        <div
                          key={wf.id}
                          className="p-3 border rounded flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <div className="font-medium">{wf.name}</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {steps.map((step, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                >
                                  {idx + 1}. {step}
                                </span>
                              ))}
                              {!steps.length && (
                                <span className="text-xs text-gray-500">No approvers yet - add a step.</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                const name = prompt('Rename workflow', wf.name);
                                if (name) {
                                  setPolicy((p) => ({
                                    ...p,
                                    approvalWorkflows: p.approvalWorkflows.map((x) =>
                                      x.id === wf.id ? { ...x, name } : x
                                    ),
                                  }));
                                }
                              }}
                              className="text-sm px-3 py-1 bg-gray-100 rounded"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => {
                                const step = prompt('Add step (role or person)');
                                if (step) {
                                  setPolicy((p) => ({
                                    ...p,
                                    approvalWorkflows: p.approvalWorkflows.map((x) =>
                                      x.id === wf.id ? { ...x, steps: [...(x.steps || []), step] } : x
                                    ),
                                  }));
                                }
                              }}
                              className="text-sm px-3 py-1 bg-gray-100 rounded"
                            >
                              Add Step
                            </button>
                            <button
                              onClick={() =>
                                setPolicy((p) => ({
                                  ...p,
                                  approvalWorkflows: p.approvalWorkflows.filter((x) => x.id !== wf.id),
                                }))
                              }
                              className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex gap-2">
                      <input id="new-wf" placeholder="New workflow name" className="border rounded p-2 flex-1" />
                      <button
                        onClick={() => {
                          const el = document.getElementById('new-wf');
                          if (el && el.value.trim()) {
                            addWorkflow(el.value.trim());
                          }
                          if (el) {
                            el.value = '';
                          }
                        }}
                        className="px-3 py-2 bg-purple-700 text-white rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </section>
              )}
              {activeTab === "notifications" && (
                <section className="surface-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Notifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-2 text-xs text-gray-500">
                      Choose how travellers, managers, and finance get notified when trips move through approvals.
                    </div>
                    <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <input type="checkbox" checked={policy.notificationChannels.email} onChange={(e)=> setPolicy({...policy, notificationChannels: {...policy.notificationChannels, email: e.target.checked}})} />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-xs text-gray-500">Best for detailed itineraries and receipts.</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <input type="checkbox" checked={policy.notificationChannels.sms} onChange={(e)=> setPolicy({...policy, notificationChannels: {...policy.notificationChannels, sms: e.target.checked}})} />
                      <div>
                        <div className="text-sm font-medium">SMS</div>
                        <div className="text-xs text-gray-500">Send concise alerts for urgent travel changes.</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <input type="checkbox" checked={policy.notificationChannels.slack} onChange={(e)=> setPolicy({...policy, notificationChannels: {...policy.notificationChannels, slack: e.target.checked}})} />
                      <div>
                        <div className="text-sm font-medium">Slack</div>
                        <div className="text-xs text-gray-500">Keep approvals flowing in your daily channels.</div>
                      </div>
                    </label>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium">
                        Notification Emails
                        <span className="block text-xs text-gray-500 font-normal mt-1">
                          Add shared inboxes or finance aliases (comma separated).
                        </span>
                      </label>
                      <input className="w-full border rounded p-2 mt-1" value={policy.notificationEmails} onChange={(e)=> setPolicy({...policy, notificationEmails: e.target.value})} placeholder="e.g. travelops@company.com, finance@company.com" />
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "expenses" && (
                <section className="surface-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Expense Categories & Limits</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {expenseCategories.length === 0 && (
                      <div className="col-span-3">
                        <EmptyState
                          title="No categories yet"
                          description="Add spending buckets like Meals or Transport so teams know their guardrails."
                        />
                      </div>
                    )}
                    {expenseCategories.map((k)=> (
                      <div key={k} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{k}</div>
                          <button className="text-xs text-red-600" onClick={()=> removeExpenseCategory(k)}>Remove</button>
                        </div>
                        <input className="w-full border rounded mt-2 p-2" value={policy.expenseLimits[k]} onChange={(e)=> setPolicy(p=> ({ ...p, expenseLimits: {...p.expenseLimits, [k]: e.target.value} }))} placeholder="$" />
                      </div>
                    ))}

                    <div className="col-span-3 flex gap-2">
                      <input id="new-exp" placeholder="New category name" className="border rounded p-2 flex-1" />
                      <button onClick={()=>{
                        const el=document.getElementById('new-exp');
                        if(!el) return;
                        const name = el.value.trim();
                        if(name){
                          addExpenseCategory(name);
                          el.value='';
                        }
                      }} className="px-3 py-2 bg-purple-700 text-white rounded">Add</button>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "roles" && (
                <section className="surface-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Role-Based Access</h2>
                  <div className="space-y-3">
                    {(!policy.roles || policy.roles.length === 0) && (
                      <EmptyState
                        title="No roles assigned"
                        description="Map roles to permissions so employees know what they can do inside the travel portal."
                      />
                    )}
                    {policy.roles.map((r, idx) => (
                      <div key={idx} className="p-3 border rounded flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-medium">{r.role}</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {r.permissions.map((perm, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{perm}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const name = prompt('Role name', r.role);
                              if (name) {
                                setPolicy((p) => ({
                                  ...p,
                                  roles: p.roles.map((x, i) => (i === idx ? { ...x, role: name } : x)),
                                }));
                              }
                            }}
                            className="text-sm px-3 py-1 bg-gray-100 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setPolicy((p) => ({
                                ...p,
                                roles: p.roles.filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input id="new-role" placeholder="Role name" className="border rounded p-2 flex-1" />
                      <button
                        onClick={() => {
                          const el = document.getElementById('new-role');
                          if (!el) return;
                          const name = el.value.trim();
                          if (name) {
                            setPolicy((p) => ({ ...p, roles: [...p.roles, { role: name, permissions: ['view'] }] }));
                            pushAudit(`Added role ${name}`);
                            el.value = '';
                          }
                        }}
                        className="px-3 py-2 bg-purple-700 text-white rounded"
                      >
                        Add Role
                      </button>
                    </div>
                  </div>
                </section>
              )}
              {activeTab === "audit" && (
                <section className="surface-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Audit & Versioning</h2>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">Most recent changes (click rollback to simulate)</div>
                    {(!policy.auditLog || policy.auditLog.length === 0) ? (
                      <EmptyState
                        title="No activity yet"
                        description="Save the policy or import updates to build an audit trail your compliance team can trust."
                      />
                    ) : (
                      <ul className="space-y-2">
                        {policy.auditLog.map((a, i) => (
                          <li key={i} className="p-3 border rounded flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</div>
                              <div className="font-medium">{a.msg}</div>
                              <div className="text-xs text-gray-500">by {a.user}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => rollbackAudit(i)} className="text-sm px-3 py-1 bg-yellow-50 text-yellow-700 rounded">Rollback</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              )}
              {activeTab === "templates" && (
                <section className="surface-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Templates</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {templateExamples.map((tpl)=> (
                      <div key={tpl.meta.name} className="p-4 border rounded hover:shadow cursor-pointer transition">
                        <div className="font-medium">{tpl.meta.name}</div>
                        <div className="text-xs text-gray-500">Budget ${tpl.budgetLimit || 'n/a'}</div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={()=> loadTemplate(tpl)} className="px-3 py-1 bg-purple-700 text-white rounded">Load</button>
                          <button onClick={()=> openTemplatePreview(tpl)} className="px-3 py-1 bg-gray-100 rounded">Preview</button>
                        </div>
                      </div>
                    ))}

                    <div className="col-span-3 space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">Your saved templates</h3>
                      {savedTemplates.length === 0 ? (
                        <EmptyState
                          title="No saved templates yet"
                          description="Capture your favourite policy setups so you can reapply them in a single click."
                        />
                      ) : (
                        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3">
                          {savedTemplates.map((tpl, idx) => (
                            <div key={idx} className="p-4 border rounded bg-white shadow-sm flex flex-col gap-3">
                              <div>
                                <div className="text-sm font-medium">{tpl.meta?.name || `Template ${idx + 1}`}</div>
                                <div className="text-xs text-gray-500">
                                  Updated {tpl.meta?.updated ? new Date(tpl.meta.updated).toLocaleDateString() : 'recently'}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={()=> loadTemplate(tpl)} className="px-3 py-1 bg-purple-700 text-white rounded text-sm flex-1">Load</button>
                                <button onClick={()=> openTemplatePreview(tpl)} className="px-3 py-1 bg-gray-100 rounded text-sm flex-1">Preview</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border rounded col-span-3 bg-gray-50">
                      <div className="text-sm font-medium text-gray-700 mb-2">Save current setup as template</div>
                      <div className="flex gap-2">
                        <input id="new-tpl-name" className="border rounded p-2 flex-1" placeholder="Template name" />
                        <button onClick={()=> {
                          const el=document.getElementById('new-tpl-name');
                          if(!el) return;
                          const name = el.value.trim();
                          if(name){
                            const tpl={ ...policy, meta:{ ...(policy.meta||{}), name } };
                            setPolicy(p=> ({ ...p, templates: [...(p.templates||[]), tpl] }));
                            pushAudit(`Saved template ${name}`);
                            el.value='';
                          }
                        }} className="px-3 py-2 bg-green-600 text-white rounded">Save as Template</button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>

          <aside className="order-3 xl:col-span-3">
            <div ref={previewRef} className="bg-gray-50 p-4 rounded-lg xl:sticky xl:top-6 shadow-sm">
              <h3 className="font-medium">Live Preview</h3>
              <div className="text-xs text-gray-500 mb-2">Preview of selected settings</div>
              <div className="bg-white p-3 rounded border max-h-64 overflow-auto text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500">Policy</div>
                    <div className="font-medium text-sm">{policy.meta?.name || 'Untitled'}</div>

                    <div className="mt-2 flex gap-2 items-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">{policy.bookingClass}</span>
                      {policy.budgetLimit ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Budget ${policy.budgetLimit}</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">No budget set</span>
                      )}
                      {policy.highRiskDestinations && policy.highRiskDestinations.length > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">High risk: {policy.highRiskDestinations.join(', ')}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-right">
                    <div>Updated</div>
                    <div className="font-mono text-[11px]">{policy.meta?.updated ? new Date(policy.meta.updated).toLocaleString() : ''}</div>
                  </div>
                </div>

                <hr className="my-2" />

                <div className="text-sm">
                  <div className="text-xs text-gray-500">Approvals</div>
                  <ul className="mt-1 space-y-1">
                    {policy.approvalWorkflows.map((wf) => (
                      <li key={wf.id} className="text-sm">
                        <span className="font-medium">{wf.name}</span>
                        <span className="text-xs text-gray-500"> &nbsp;({wf.steps.join(' -> ')})</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 text-xs text-gray-500">Notifications</div>
                  <div className="flex gap-2 mt-1">
                    {policy.notificationChannels.email && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Email</span>}
                    {policy.notificationChannels.sms && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">SMS</span>}
                    {policy.notificationChannels.slack && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Slack</span>}
                    {!policy.notificationChannels.email && !policy.notificationChannels.sms && !policy.notificationChannels.slack && (
                      <span className="text-xs text-gray-500">No channels</span>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">Expense limits</div>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.keys(policy.expenseLimits).map((k) => (
                      <div key={k} className="text-sm">
                        <div className="text-xs text-gray-500">{k}</div>
                        <div className="font-medium">{policy.expenseLimits[k] || 'Not set'}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">Roles</div>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {policy.roles.map((r, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">{r.role}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-500">Assignments</div>
                  <div className="mt-2 text-sm">
                    <div className="text-xs text-gray-400">Assigned Groups</div>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      {(policy.assignedGroups||[]).map((g,i) => (
                        <span key={i} className="px-2 py-1 bg-white border rounded text-xs flex items-center gap-2">{g} <button onClick={()=> setPolicy(p=> ({ ...p, assignedGroups: p.assignedGroups.filter(x=> x!==g) }))} className="text-red-500 text-[10px]">x</button></span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input id="add-group" className="border rounded p-2 flex-1 text-sm" placeholder="Add group" />
                      <button onClick={()=>{ const el=document.getElementById('add-group'); if(el && el.value.trim()){ setPolicy(p=> ({ ...p, assignedGroups: [...(p.assignedGroups||[]), el.value.trim()] })); el.value=''; } }} className="px-3 py-2 bg-white border rounded text-sm">Add</button>
                    </div>

                    <div className="mt-3 text-xs text-gray-400">Cost Centers</div>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      {(policy.costCenters||[]).map((c,i) => (
                        <span key={i} className="px-2 py-1 bg-white border rounded text-xs flex items-center gap-2">{c} <button onClick={()=> setPolicy(p=> ({ ...p, costCenters: p.costCenters.filter(x=> x!==c) }))} className="text-red-500 text-[10px]">x</button></span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input id="add-cc" className="border rounded p-2 flex-1 text-sm" placeholder="Add cost center" />
                      <button onClick={()=>{ const el=document.getElementById('add-cc'); if(el && el.value.trim()){ setPolicy(p=> ({ ...p, costCenters: [...(p.costCenters||[]), el.value.trim()] })); el.value=''; } }} className="px-3 py-2 bg-white border rounded text-sm">Add</button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(JSON.stringify(policy, null, 2));
                        } else {
                          const ta = document.createElement('textarea');
                          ta.value = JSON.stringify(policy, null, 2);
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand('copy');
                          document.body.removeChild(ta);
                        }
                        alert('Policy preview JSON copied to clipboard');
                      } catch (e) { alert('Copy failed'); }
                    }}
                    className="flex-1 px-3 py-2 bg-white border rounded text-sm"
                  >
                    Copy JSON
                  </button>

                  <button onClick={() => exportPolicy()} className="px-3 py-2 bg-white border rounded text-sm">Export</button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">Export / Import</div>
                <div className="flex gap-2">
                  <button onClick={exportPolicy} className="flex-1 px-3 py-2 bg-white border rounded">Export JSON</button>
                  <label className="flex-1 px-3 py-2 bg-white border rounded text-center cursor-pointer">
                    Import
                    <input className="hidden" type="file" accept="application/json" onChange={(e)=> e.target.files && importPolicy(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 mb-1">Versions</div>
                  <div>
                    <button onClick={()=>{
                      // save current as a version
                      try{
                        const copy = JSON.parse(JSON.stringify(policy));
                        copy.snapshotAt = new Date().toISOString();
                        copy.meta = { ...(copy.meta||{}), name: copy.meta?.name || 'policy' };
                        const updated = { ...policy, versions: [copy, ...(policy.versions||[])] };
                        setPolicy(updated);
                        pushAudit('Saved manual version');
                        // also update policies list storage
                        setPolicies(prev => { const next = prev.map(p => p.meta?.id === updated.meta?.id ? updated : p); try{ localStorage.setItem(POLICIES_KEY, JSON.stringify(next)); }catch{}; return next; });
                        alert('Version saved');
                      }catch(e){ console.warn(e); }
                    }} className="px-2 py-1 bg-white border rounded text-xs">Save version</button>
                  </div>
                </div>

                <div className="max-h-44 overflow-auto bg-white border rounded p-2">
                  { (policy.versions || []).length === 0 && <div className="text-xs text-gray-500">No saved versions</div> }
                  { (policy.versions || []).map((v, i) => (
                    <div key={v.snapshotAt || i} className="flex items-center justify-between p-2 border-b text-xs">
                      <div>
                        <div className="font-medium">{v.meta?.name || policy.meta?.name} <span className="text-gray-400">#{i+1}</span></div>
                        <div className="text-gray-500">{new Date(v.snapshotAt).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>{
                          if(!confirm('Revert to this version? This will overwrite the current editor state.')) return;
                          setPolicy(JSON.parse(JSON.stringify(v)));
                          pushAudit(`Reverted to version ${v.snapshotAt}`);
                        }} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">Revert</button>

                        <button onClick={()=> exportPolicyObject(v)} className="px-2 py-1 bg-white border rounded text-xs">Export</button>

                        <button onClick={()=>{
                          if(!confirm('Delete this version?')) return;
                          setPolicy(p=> ({ ...p, versions: (p.versions||[]).filter((_,idx)=> idx!==i) }));
                          pushAudit('Deleted version');
                        }} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* diff/compare area */}
                <div className="mt-2 text-xs text-gray-500">Compare a version to current</div>
                <div className="flex gap-2 mt-2">
                  <select id="version-compare-select" className="flex-1 border rounded p-2 text-sm">
                    <option value="">Select version...</option>
                    { (policy.versions||[]).map((v, i) => (<option key={i} value={i}>{new Date(v.snapshotAt).toLocaleString()}</option>)) }
                  </select>
          <button onClick={()=>{
            const sel = document.getElementById('version-compare-select');
            if(!sel || !sel.value) { alert('Choose a version to compare'); return; }
            const idx = Number(sel.value);
            const v = (policy.versions||[])[idx];
            if(!v) { alert('Version not found'); return; }
            const diffs = computeDiff(v, policy);
            setDiffsForModal(diffs);
            setDiffModalOpen(true);
          }} className="px-3 py-2 bg-white border rounded text-sm">Compare</button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">Shortcuts</div>
                <div className="flex flex-col gap-2">
                  <button onClick={()=> activateTab('audit', 5)} className="px-3 py-2 bg-white border rounded text-left">Open Audit</button>
                  <button onClick={()=> activateTab('templates', 6)} className="px-3 py-2 bg-white border rounded text-left">Open Templates</button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">Version: 1.0 - local demo (no server).</div>
          </aside>
        </div>

        <div className="pointer-events-none fixed bottom-4 sm:bottom-6 left-1/2 z-40 w-full max-w-[95vw] sm:max-w-2xl lg:max-w-3xl -translate-x-1/2 px-2 sm:px-4">
          <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-full border border-purple-100 bg-white/95 px-4 sm:px-6 py-3 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span
                className={`h-2 w-2 rounded-full ${hasUnsavedChanges ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
              />
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={savePolicy}
                disabled={!hasUnsavedChanges}
                className="px-4 py-2 rounded-full bg-purple-700 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition hover:bg-purple-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={scrollToPreview}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-300 hover:text-purple-700 transition"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={handleQuickCompare}
                disabled={!hasVersionHistory}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-300 hover:text-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Compare
              </button>
              <button
                type="button"
                onClick={exportPolicy}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-300 hover:text-purple-700 transition"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="surface-card max-w-3xl w-full p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Template preview - {previewTemplate.meta?.name || 'Template'}</h3>
                <div className="text-xs text-gray-500">Preview of template before loading</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=> { exportObjectAsJSON(previewTemplate, `${previewTemplate.meta?.name || 'template'}.json`); }} className="px-3 py-1 bg-white border rounded">Export</button>
                <button onClick={()=> { try{ navigator.clipboard.writeText(JSON.stringify(previewTemplate, null, 2)); alert('Template JSON copied'); }catch(e){ alert('Copy failed'); } }} className="px-3 py-1 bg-white border rounded">Copy JSON</button>
                <button onClick={()=> { loadTemplate(previewTemplate); closeTemplatePreview(); }} className="px-3 py-1 bg-purple-700 text-white rounded">Load</button>
                <button onClick={closeTemplatePreview} className="px-3 py-1 bg-gray-100 rounded">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Metadata</div>
                <div className="p-3 bg-gray-50 rounded mt-1 text-sm font-mono max-h-56 overflow-auto">{JSON.stringify(previewTemplate.meta || {}, null, 2)}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Summary</div>
                <div className="p-3 bg-gray-50 rounded mt-1 text-sm max-h-56 overflow-auto">
                  <div><strong>Booking class:</strong> {previewTemplate.bookingClass}</div>
                  <div><strong>Budget:</strong> {previewTemplate.budgetLimit || 'Not set'}</div>
                  <div className="mt-2"><strong>Notifications:</strong> {Object.keys(previewTemplate.notificationChannels || {}).filter(k=> previewTemplate.notificationChannels[k]).join(', ') || 'None'}</div>
                  <div className="mt-2"><strong>Workflows:</strong>
                    <ul className="mt-1 ml-4 list-disc text-sm">
                      {(previewTemplate.approvalWorkflows || []).map(wf => (<li key={wf.id}>{wf.name} - {wf.steps.join(' -> ')}</li>))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <VersionDiffModal open={diffModalOpen} onClose={()=> setDiffModalOpen(false)} diffs={diffsForModal} title="Version Compare" />
    </div>
  );
}
