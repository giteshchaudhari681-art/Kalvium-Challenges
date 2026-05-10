import React from 'react';
import CustomerRow from '../components/CustomerRow';
import { EmptyState, ErrorMessage, SkeletonCard } from '../components/states';
import { useCustomers } from '../hooks/useCustomers';

const Customers = () => {
  const { data: customers, isLoading, error, refetch } = useCustomers();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-800">Customer Management</h1>

      {isLoading ? (
        <SkeletonCard count={5} variant="customer" />
      ) : error ? (
        <ErrorMessage
          message="We couldn't load your customer list. Try again to reconnect and restore shopper profiles."
          onRetry={refetch}
        />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers to show"
          message="Customer profiles will appear here after shoppers place orders or create accounts."
          actionLabel="Refresh customers"
          onAction={refetch}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 capitalize">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Order History</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Total Value</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {customers.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;
