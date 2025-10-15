import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import TravelDashboard from './dashboard-beautiful.jsx';
import Dashboard1 from './components/dashboard1.jsx';
import PolicyBuilder from './policy-simple.jsx';
import Trips from './trips-simple.jsx';
import Risk from './risk-simple.jsx';
import ExpensePage from './expense-simple.jsx';
import Documents from './documents-simple.jsx';
import ReportsPage from './reports-simple.jsx';
import AnalyticsPage from './analytics-simple.jsx';

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
