import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Transactions from './pages/Transactions';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              T
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              TxnTracker
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm font-bold text-brand-600">
              Dashboard
            </a>
            <a
              href="#"
              className="text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
            >
              Accounts
            </a>
            <a
              href="#"
              className="text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
            >
              Cards
            </a>
            <a
              href="#"
              className="text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
            >
              Team
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-xs font-bold text-indigo-700">
              JS
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/" element={<Navigate to="/transactions" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
