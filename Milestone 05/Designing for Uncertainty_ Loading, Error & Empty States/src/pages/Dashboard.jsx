import React from 'react';
import { BarChart3, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { EmptyState, ErrorMessage, SkeletonCard } from '../components/states';
import { useDashboard } from '../hooks/useDashboard';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div>
      <p className="mb-1 text-sm font-semibold text-gray-500">{title}</p>
      <h3 className="text-2xl font-black tracking-tight text-gray-800">{value}</h3>
    </div>
    <div className={`rounded-2xl p-3 ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard = () => {
  const { data: stats, isLoading, error, refetch } = useDashboard();
  const isEmpty = !stats || Object.keys(stats).length === 0;

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-800">Overview Dashboard</h1>

      {isLoading ? (
        <>
          <SkeletonCard count={4} variant="stat" />
          <div className="state-skeleton relative mt-8 min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent">
            <div className="h-5 w-40 rounded-full bg-slate-200" />
            <div className="mt-8 grid h-[210px] grid-cols-4 items-end gap-5">
              <div className="rounded-t-3xl bg-slate-100" style={{ height: '42%' }} />
              <div className="rounded-t-3xl bg-slate-200" style={{ height: '78%' }} />
              <div className="rounded-t-3xl bg-slate-100" style={{ height: '58%' }} />
              <div className="rounded-t-3xl bg-slate-200" style={{ height: '88%' }} />
            </div>
          </div>
        </>
      ) : error ? (
        <ErrorMessage
          message="We couldn't load your storefront overview. Check your connection and try again to refresh today's metrics."
          onRetry={refetch}
        />
      ) : isEmpty ? (
        <EmptyState
          title="No performance data yet"
          message="Your overview cards will appear once orders, revenue, and customer activity start flowing into ShopDash."
          actionLabel="Refresh overview"
          onAction={refetch}
        />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              title="Orders"
              value={stats.totalOrders}
              icon={ShoppingBag}
              color="bg-sky-100 text-sky-700"
            />
            <StatCard
              title="Active Users"
              value={stats.activeCustomers}
              icon={Users}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              title="Avg Order"
              value={`$${stats.averageOrderValue}`}
              icon={BarChart3}
              color="bg-orange-100 text-orange-600"
            />
          </div>

          <div className="min-h-[300px] rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Revenue shape</p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">This week at a glance</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
                Live mock data
              </div>
            </div>
            <div className="mt-10 grid h-[210px] grid-cols-4 items-end gap-5">
              <div className="rounded-t-[2rem] bg-gradient-to-t from-sky-500 to-cyan-300" style={{ height: '42%' }} />
              <div className="rounded-t-[2rem] bg-gradient-to-t from-slate-900 to-slate-700" style={{ height: '78%' }} />
              <div className="rounded-t-[2rem] bg-gradient-to-t from-emerald-500 to-teal-300" style={{ height: '58%' }} />
              <div className="rounded-t-[2rem] bg-gradient-to-t from-orange-500 to-amber-300" style={{ height: '88%' }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
