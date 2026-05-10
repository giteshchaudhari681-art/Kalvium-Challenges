import React from 'react';
import ProductCard from '../components/ProductCard';
import { EmptyState, ErrorMessage, SkeletonCard } from '../components/states';
import { useProducts } from '../hooks/useProducts';

const Products = () => {
  const { data: products, isLoading, error, refetch } = useProducts();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Product Inventory</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Filter
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
            Add Product
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard count={6} variant="product" />
      ) : error ? (
        <ErrorMessage
          message="We couldn't load your inventory. Try again to reconnect to the product catalog and stock counts."
          onRetry={refetch}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products in inventory"
          message="Add your first product to start tracking stock, pricing, and catalog performance."
          actionLabel="Add product"
          onAction={() => window.alert('Add Product flow is not wired in this challenge yet.')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
