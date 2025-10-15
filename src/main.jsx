import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import TravelDashboard from './dashboard.jsx';
import Dashboard1 from './components/dashboard1.jsx';
console.log('[debug] main.jsx imported Dashboard1:', typeof Dashboard1);
import PolicyBuilder from './policy.jsx';
import Trips from './trips.jsx';
import Risk from './risk.jsx';
import ExpensePage from './expense.jsx';
import Documents from './documents.jsx';
import ReportsPage from './reports.jsx';
import AnalyticsPage from './analytics.jsx';

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<TravelDashboard />} />
			<Route path="/policy" element={<PolicyBuilder />} />
			<Route path="/trips" element={<Trips />} />
			<Route path="/dashboard1" element={<Dashboard1 />} />
			<Route path="/reports" element={<ReportsPage />} />
			<Route path="/risk" element={<Risk />} />
			<Route path="/expense" element={<ExpensePage />} />
			<Route path="/documents" element={<Documents />} />
			<Route path="/analytics" element={<AnalyticsPage />} />
		</Routes>
	);
}

const el = document.getElementById('root');
if (el) {
	const root = createRoot(el);
	root.render(
		<React.StrictMode>
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
		</React.StrictMode>
	);
}
