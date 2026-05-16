import React from 'react';
import { List } from 'react-window';
import TransactionRow from './TransactionRow';

const LIST_HEIGHT = 649;
const ROW_HEIGHT = 83;

const EmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center space-y-3 p-8 text-gray-500">
    <div className="rounded-full bg-gray-50 p-4">
      <svg
        className="h-12 w-12 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <p className="text-lg font-medium">No transactions found</p>
    <p className="text-sm">Try adjusting your search filters</p>
  </div>
);

const VirtualRow = ({ index, style, transactions, onSelect }) => {
  const transaction = transactions[index];

  return (
    <TransactionRow
      transaction={transaction}
      onSelect={onSelect}
      style={style}
    />
  );
};

const TransactionList = ({ transactions, onSelect }) => {
  return (
    <div className="flex h-[700px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex-1">
        {transactions.length > 0 ? (
          <List
            className="custom-scrollbar"
            defaultHeight={LIST_HEIGHT}
            rowCount={transactions.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ transactions, onSelect }}
            rowComponent={VirtualRow}
            overscanCount={4}
            style={{ height: LIST_HEIGHT }}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-gray-400">
          End of Transactions
        </p>
      </div>
    </div>
  );
};

export default TransactionList;
