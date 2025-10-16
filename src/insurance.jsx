import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';

export default function InsuranceManagement() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('td_insurance_policies') || '[]');
    } catch {
      return [];
    }
  });

  const [employees, setEmployees] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('td_employees') || '[]');
    } catch {
      return [];
    }
  });

  // Mock data
  useEffect(() => {
    if (policies.length === 0) {
      const mockPolicies = [
        {
          id: 'ins_1',
          employeeId: 'e1',
          employeeName: 'Alice Johnson',
          tripId: 't1',
          destination: 'London, UK',
          provider: 'Global Travel Insurance',
          policyNumber: 'GTI-2025-001234',
          coverage: 'Comprehensive',
          coverageAmount: 500000,
          startDate: '2025-10-20',
          endDate: '2025-10-25',
          status: 'active',
          premium: 150,
          documents: ['policy.pdf', 'terms.pdf'],
        },
        {
          id: 'ins_2',
          employeeId: 'e2',
          employeeName: 'Bob Smith',
          tripId: 't2',
          destination: 'Tokyo, Japan',
          provider: 'SafeTravel Insurance',
          policyNumber: 'STI-2025-005678',
          coverage: 'Medical Only',
          coverageAmount: 250000,
          startDate: '2025-11-01',
          endDate: '2025-11-10',
          status: 'pending',
          premium: 95,
          documents: [],
        },
        {
          id: 'ins_3',
          employeeId: 'e1',
          employeeName: 'Alice Johnson',
          tripId: 't3',
          destination: 'Dubai, UAE',
          provider: 'Global Travel Insurance',
          policyNumber: 'GTI-2025-001890',
          coverage: 'Comprehensive',
          coverageAmount: 500000,
          startDate: '2025-09-15',
          endDate: '2025-09-20',
          status: 'expired',
          premium: 120,
          documents: ['policy.pdf'],
        },
      ];
      setPolicies(mockPolicies);
      localStorage.setItem('td_insurance_policies', JSON.stringify(mockPolicies));
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const stats = {
    total: policies.length,
    active: policies.filter((p) => p.status === 'active').length,
    pending: policies.filter((p) => p.status === 'pending').length,
    expired: policies.filter((p) => p.status === 'expired').length,
    totalCoverage: policies.reduce((sum, p) => sum + p.coverageAmount, 0),
    totalPremium: policies.reduce((sum, p) => sum + p.premium, 0),
  };

  return (
    <div className="min-h-screen app-root p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Insurance Management</h1>
                    <p className="text-emerald-100 mt-1">Track and manage travel insurance policies for all employees</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">{stats.total} Policies</div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">{stats.active} Active</div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">${(stats.totalCoverage / 1000000).toFixed(1)}M Coverage</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5l-5 5 5 5" />
                  </svg>
                  Back
                </button>
                <button className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Policy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="surface-card p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.active}</span>
            </div>
            <p className="text-gray-600 font-medium">Active Policies</p>
            <p className="text-sm text-gray-500 mt-1">Currently in force</p>
          </div>

          <div className="surface-card p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
            </div>
            <p className="text-gray-600 font-medium">Pending</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting activation</p>
          </div>

          <div className="surface-card p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">${(stats.totalCoverage / 1000000).toFixed(1)}M</span>
            </div>
            <p className="text-gray-600 font-medium">Total Coverage</p>
            <p className="text-sm text-gray-500 mt-1">Combined protection</p>
          </div>

          <div className="surface-card p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">${stats.totalPremium}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Premium</p>
            <p className="text-sm text-gray-500 mt-1">This period</p>
          </div>
        </div>

        {/* Policies Table */}
        <div className="surface-card rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Insurance Policies</h3>
            <p className="text-sm text-gray-600 mt-1">Manage all travel insurance policies</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Policy Number</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Coverage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold">{policy.employeeName.charAt(0)}</div>
                        <div>
                          <div className="font-semibold text-gray-900">{policy.employeeName}</div>
                          <div className="text-sm text-gray-500">ID: {policy.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{policy.destination}</div>
                      <div className="text-sm text-gray-500">Trip: {policy.tripId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{policy.provider}</div>
                      <div className="text-sm text-gray-500">{policy.coverage}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-900">{policy.policyNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">${policy.coverageAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Premium: ${policy.premium}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{policy.startDate}</div>
                      <div className="text-sm text-gray-500">to {policy.endDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(policy.status)}`}>
                        {getStatusIcon(policy.status)}
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
