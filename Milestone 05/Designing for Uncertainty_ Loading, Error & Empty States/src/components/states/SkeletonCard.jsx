import React from 'react';

const skeletonVariants = {
  order: (
    <div className="state-skeleton relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 w-24 rounded-full bg-slate-200" />
          <div className="mt-3 h-3 w-32 rounded-full bg-slate-100" />
        </div>
        <div className="w-24">
          <div className="ml-auto h-4 w-16 rounded-full bg-slate-200" />
          <div className="mt-3 ml-auto h-6 w-20 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  ),
  product: (
    <div className="state-skeleton relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent">
      <div className="h-32 rounded-lg bg-slate-200" />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 w-40 rounded-full bg-slate-200" />
          <div className="mt-3 h-3 w-24 rounded-full bg-slate-100" />
        </div>
        <div className="h-4 w-16 rounded-full bg-slate-200" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="h-3 w-20 rounded-full bg-slate-100" />
        <div className="h-3 w-16 rounded-full bg-slate-200" />
      </div>
    </div>
  ),
  customer: (
    <div className="state-skeleton relative overflow-hidden border-b border-slate-100 bg-white px-6 py-4 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent last:border-b-0">
      <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_auto] items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
          <div className="flex-1">
            <div className="h-4 w-28 rounded-full bg-slate-200" />
            <div className="mt-2 h-3 w-40 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="h-4 w-20 rounded-full bg-slate-100" />
        <div className="h-4 w-16 rounded-full bg-slate-200" />
        <div className="h-4 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  ),
  stat: (
    <div className="state-skeleton relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="h-3 w-24 rounded-full bg-slate-100" />
          <div className="mt-4 h-8 w-24 rounded-full bg-slate-200" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-200" />
      </div>
    </div>
  ),
};

const wrappers = {
  order: 'grid grid-cols-1 gap-4',
  product: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
  customer: 'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
  stat: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4',
};

const SkeletonCard = ({ count = 1, variant = 'order' }) => {
  const template = skeletonVariants[variant] ?? skeletonVariants.order;
  const wrapperClassName = wrappers[variant] ?? wrappers.order;

  return (
    <div className={wrapperClassName} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <React.Fragment key={`${variant}-${index}`}>{template}</React.Fragment>
      ))}
    </div>
  );
};

export default SkeletonCard;
