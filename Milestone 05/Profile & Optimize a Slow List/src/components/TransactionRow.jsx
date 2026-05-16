import React from 'react';
import {
  Calendar,
  CreditCard,
  ShoppingBag,
  Truck,
  Tv,
  Utensils,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const CATEGORY_ICONS = {
  Shopping: ShoppingBag,
  Entertainment: Tv,
  Food: Utensils,
  Transport: Truck,
  Utilities: Zap,
};

const CATEGORY_COLORS = {
  Shopping: 'bg-blue-100 text-blue-700 border-blue-200',
  Entertainment: 'bg-purple-100 text-purple-700 border-purple-200',
  Food: 'bg-orange-100 text-orange-700 border-orange-200',
  Transport: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Utilities: 'bg-amber-100 text-amber-700 border-amber-200',
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

const areEqual = (previousProps, nextProps) => {
  const previousStyle = previousProps.style ?? {};
  const nextStyle = nextProps.style ?? {};

  return (
    previousProps.transaction === nextProps.transaction &&
    previousProps.onSelect === nextProps.onSelect &&
    previousStyle.height === nextStyle.height &&
    previousStyle.top === nextStyle.top &&
    previousStyle.left === nextStyle.left &&
    previousStyle.width === nextStyle.width
  );
};

const TransactionRow = ({ transaction, onSelect, style }) => {
  if (typeof window !== 'undefined' && window.__txnPerf) {
    window.__txnPerf.rowRenderCount += 1;
  }

  const Icon = CATEGORY_ICONS[transaction.category] || CreditCard;
  const dateStr = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      style={style}
      data-transaction-row="true"
      data-transaction-id={transaction.id}
      onClick={() => onSelect(transaction.id)}
      className="group flex cursor-pointer items-center gap-4 border-b border-gray-100 p-4 transition-colors hover:bg-gray-50"
    >
      <div className={cn('rounded-xl border p-2', CATEGORY_COLORS[transaction.category])}>
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-gray-900">
            {transaction.name}
          </h3>
          <span className="whitespace-nowrap font-bold text-gray-900">
            -${transaction.amount.toFixed(2)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                CATEGORY_COLORS[transaction.category]
              )}
            >
              {transaction.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {dateStr}
            </span>
          </div>

          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
              STATUS_COLORS[transaction.status]
            )}
          >
            {transaction.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TransactionRow, areEqual);
