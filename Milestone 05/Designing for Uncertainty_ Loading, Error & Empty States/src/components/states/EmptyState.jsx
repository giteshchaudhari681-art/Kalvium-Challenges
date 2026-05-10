import React from 'react';
import { Inbox, Sparkles } from 'lucide-react';

const EmptyState = ({ title, message, actionLabel, onAction }) => {
  return (
    <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-sky-100 text-sky-700 shadow-sm">
        <Inbox size={34} />
      </div>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm">
        <Sparkles size={14} />
        Ready for first activity
      </div>
      <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sky-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
