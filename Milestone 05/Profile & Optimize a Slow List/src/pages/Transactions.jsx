import React, { Profiler, useCallback, useState } from 'react';
import {
  ArrowUpRight,
  Filter,
  Plus,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import TransactionList from '../components/TransactionList';
import { useTransactions } from '../hooks/useTransactions';

const stats = [
  {
    label: 'Total Volume',
    value: '$12,450.00',
    icon: Wallet,
    color: 'text-brand-600',
    bg: 'bg-brand-50',
  },
  {
    label: 'Average Value',
    value: '$245.90',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Merchant Count',
    value: '50',
    icon: ArrowUpRight,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

const recordProfilerSample = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (typeof window === 'undefined') {
    return;
  }

  const perfStore = (window.__txnPerf ??= {
    commits: [],
    totalActualDuration: 0,
    rowRenderCount: 0,
    filterComputeCount: 0,
  });

  perfStore.commits.push({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
  perfStore.totalActualDuration += actualDuration;
};

const Transactions = () => {
  const { filteredTransactions, filter, setFilter } = useTransactions();
  const [selectedId, setSelectedId] = useState(null);
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);
  const selectedTransaction = filteredTransactions.find(
    (transaction) => transaction.id === selectedId
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Financial Dashboard
          </h1>
          <p className="font-medium text-gray-500">
            Manage and track your latest business transactions
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-700">
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Transaction</span>
        </button>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search transactions or categories..."
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 font-medium shadow-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button className="rounded-2xl border border-gray-200 bg-white p-3 text-gray-500 hover:bg-gray-50">
              <Filter size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <p className="text-sm font-semibold text-gray-500">
              Showing{' '}
              <span className="font-bold text-gray-900">
                {filteredTransactions.length}
              </span>{' '}
              transactions
            </p>
            <div className="cursor-pointer text-sm font-bold text-brand-600 hover:underline">
              Export CSV
            </div>
          </div>

          <Profiler id="TransactionList" onRender={recordProfilerSample}>
            <TransactionList transactions={filteredTransactions} onSelect={handleSelect} />
          </Profiler>
        </div>

        <aside className="w-full space-y-6 lg:w-80">
          <div className="min-h-[400px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {selectedTransaction ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl font-bold text-gray-600">
                    {selectedTransaction.name[0]}
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-gray-400">
                      Status
                    </p>
                    <span className="rounded bg-green-50 px-2 py-1 text-xs font-bold text-green-600">
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                <h3 className="mb-1 text-xl font-bold text-gray-900">
                  {selectedTransaction.name}
                </h3>
                <p className="mb-6 text-sm font-medium text-gray-500">
                  {selectedTransaction.category}
                </p>

                <div className="mb-6 space-y-4 border-y border-gray-100 py-6">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-400">Date</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(selectedTransaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-400">
                      Reference
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      #TXN-{selectedTransaction.id.toString().padStart(5, '0')}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Amount
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    -${selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center opacity-40">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
                  <Plus className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  Select a transaction
                  <br />
                  to view detailed data
                </p>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-6 text-white">
            <div className="relative z-10">
              <h4 className="mb-2 text-lg font-bold">Upgrade to Pro</h4>
              <p className="mb-4 text-xs text-brand-200">
                Get custom reports, unlimited exports, and real-time bank syncing.
              </p>
              <button className="rounded-lg bg-white px-4 py-2 text-xs font-extrabold text-brand-900 transition-colors hover:bg-brand-50">
                Learn More
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-brand-800 opacity-50 blur-2xl" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Transactions;
