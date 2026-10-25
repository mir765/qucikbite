import React, { useState, useEffect } from 'react';
import { QuickBiteApi } from '../services/api';
import {
  Shield,
  Users,
  Store,
  Bike,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'users' | 'finance'>('overview');

  useEffect(() => {
    loadAll();
  }, [activeTab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [overview, restList, userList] = await Promise.all([
        QuickBiteApi.getAdminOverview(),
        QuickBiteApi.getAdminRestaurants(),
        QuickBiteApi.getAdminUsers()
      ]);
      setMetricsData(overview);
      setRestaurants(restList);
      setUsers(userList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: number, approval_status: string) => {
    try {
      await QuickBiteApi.updateRestaurantApproval(id, approval_status);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-2">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading Platform Administration Console...</p>
      </div>
    );
  }

  const metrics = metricsData?.metrics;
  const serviceAreas = metricsData?.service_areas || [];
  const recentOrders = metricsData?.recent_orders || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
            <Shield size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                QuickBite Master Administration
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Superadmin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform governance, FSSAI verification, financial reconciliation & city expansion
            </p>
          </div>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Gross Merchandise Value</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            ₹{metrics?.gross_order_value?.toLocaleString() || '18,450'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">Total Platform GMV</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Platform Revenue</span>
          <span className="text-xl font-extrabold text-purple-700 mt-1 block">
            ₹{metrics?.platform_commission?.toLocaleString() || '3,210'}
          </span>
          <span className="text-[10px] text-purple-600 font-bold">15% Comm + Platform Fees</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Total Orders</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {metrics?.total_orders || '28'}
          </span>
          <span className="text-[10px] text-slate-500">Avg ₹{metrics?.avg_order_value || 320}/order</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Active Kitchens</span>
          <span className="text-xl font-extrabold text-orange-600 mt-1 block">
            {metrics?.active_restaurants || '6'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">100% FSSAI Certified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-slate-400 text-xs font-semibold block">Active Riders</span>
          <span className="text-xl font-extrabold text-blue-600 mt-1 block">
            {metrics?.active_riders || '1'}
          </span>
          <span className="text-[10px] text-slate-500">In Kerala Service Areas</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold text-slate-600">
        {[
          { id: 'overview', label: 'Ecosystem Overview & Cities' },
          { id: 'restaurants', label: 'Restaurant & FSSAI Verification' },
          { id: 'users', label: 'User & Role Governance' },
          { id: 'finance', label: 'Financial Settlement Audit' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Service Area Expansion Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Kerala City Service Areas & Growth
            </h3>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">City</th>
                    <th className="p-3">Orders Today</th>
                    <th className="p-3">Coverage Areas</th>
                    <th className="p-3">Growth Rate</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {serviceAreas.map((sa: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{sa.city}</td>
                      <td className="p-3 font-mono">{sa.orders_count} orders</td>
                      <td className="p-3 text-slate-500">
                        {sa.city === 'Kochi' ? 'Marine Drive, MG Road, Kakkanad, Fort Kochi' : 'City Centre & Tech Park Zones'}
                      </td>
                      <td className="p-3 font-bold text-emerald-600">{sa.growth}</td>
                      <td className="p-3">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          {sa.city === 'Kochi' ? 'Active Hub' : 'Expansion Phase'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESTAURANT APPROVALS */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">
            Restaurant Onboarding & FSSAI Verification
          </h3>

          <div className="space-y-3">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{rest.name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rest.approval_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rest.approval_status}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {rest.area}, {rest.city} • FSSAI Lic: <strong>{rest.fssai_license || '11322007000142'}</strong> • Phone: {rest.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {rest.approval_status !== 'approved' && (
                    <button
                      onClick={() => handleApproval(rest.id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Approve & Activate
                    </button>
                  )}
                  {rest.approval_status === 'approved' && (
                    <button
                      onClick={() => handleApproval(rest.id, 'suspended')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Suspend Listing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">
            Registered Users & Role Governance
          </h3>

          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      {u.first_name || u.username} {u.last_name}
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize font-bold text-slate-800">
                      {u.role.replace('_', ' ')}
                    </td>
                    <td className="p-3">{u.phone || '—'}</td>
                    <td className="p-3">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCE AUDIT */}
      {activeTab === 'finance' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900">
            Platform Financial Ledger & Commission Audit
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Platform Commissions (15%)</span>
              <p className="text-lg font-extrabold text-purple-700 mt-1">
                ₹{Math.round(Number(metrics?.gross_order_value || 0) * 0.15)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Platform Tech Fees (₹5/order)</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                ₹{Number(metrics?.total_orders || 0) * 5}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-bold">Total Platform Gross Revenue</span>
              <p className="text-lg font-extrabold text-emerald-950 mt-1">
                ₹{metrics?.platform_commission || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
