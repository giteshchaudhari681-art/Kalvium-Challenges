import React from 'react';
import OrderCard from '../components/OrderCard';
import { EmptyState, ErrorMessage, SkeletonCard } from '../components/states';
import { useOrders } from '../hooks/useOrders';

const Orders = () => {
  const { data: orders, isLoading, error, refetch } = useOrders();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Recent Orders</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Export Report
        </button>
      </div>

      {isLoading ? (
        <SkeletonCard count={4} variant="order" />
      ) : error ? (
        <ErrorMessage
          message="We couldn't load your orders. Check your connection and try again to bring the latest order activity back."
          onRetry={refetch}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="New orders will appear here as soon as customers start checking out."
          actionLabel="Refresh orders"
          onAction={refetch}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
