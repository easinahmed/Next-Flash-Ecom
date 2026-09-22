'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getProducts, deleteProduct } from '@/lib/api';
import Link from 'next/link';
import { Plus, Trash2, Edit, Search, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton } from "@/components/Skeletons";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const name = (p.name || p.title || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    return name.includes(q) || brand.includes(q) || category.includes(q);
  });

  return (
    <AdminLayout activeSection="Products">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Catalog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and update all products in your store.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by title, category, brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-800 dark:bg-[#161623] dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-[#161623] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mt-6 shadow-xs">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <div className="p-12 text-center text-rose-500">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Try creating a product or adjusting your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProducts.map((p) => {
                  const id = p._id || p.id;
                  const title = p.name || p.title || 'Untitled';
                  const img = p.image || (p.images && p.images[0]) || p.thumbnail || '/shoe1.avif';

                  return (
                    <tr key={id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={img} alt={title} className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-gray-800" />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{title}</div>
                            <div className="text-xs text-gray-400">{p.brand || 'Flash Shoe'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                          {p.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        ৳{(p.price || 0).toLocaleString('en-BD')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          (p.stock || 0) > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {p.stock ?? 10} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/edit?id=${encodeURIComponent(id)}`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:text-gray-400 dark:hover:bg-rose-950 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
