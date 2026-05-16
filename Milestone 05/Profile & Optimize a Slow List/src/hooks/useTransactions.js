import { useMemo, useState } from 'react';
import { generateTransactions } from '../data/generateTransactions';

const initialTransactions = generateTransactions(2000);

export const useTransactions = () => {
  const [transactions] = useState(initialTransactions);
  const [filter, setFilter] = useState('');

  if (typeof window !== 'undefined' && window.__txnPerf) {
    window.__txnPerf.filterComputeCount += 1;
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.name.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.category.toLowerCase().includes(filter.toLowerCase())
    );
  }, [transactions, filter]);

  return {
    transactions,
    filteredTransactions,
    filter,
    setFilter,
  };
};
