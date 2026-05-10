import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
        <AlertTriangle size={28} />
      </div>
      <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">Something blocked this request</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
