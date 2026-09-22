'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { fetchUserOrders, cancelOrderById } from '@/services/ordersStore';
import { Search, Package, Truck, XCircle, RefreshCw, ChevronRight, MapPin, Phone, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'delivery', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'returned', label: 'Returned' },
];

const STATUS_STYLES = {
  processing: {
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-400/10',
    dot: 'bg-amber-500',
    label: 'Processing',
  },
  shipped: {
    text: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-400/10',
    dot: 'bg-blue-500',
    label: 'Shipped',
  },
  delivery: {
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-400/10',
    dot: 'bg-emerald-500',
    label: 'Delivered',
  },
  delivered: {
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-400/10',
    dot: 'bg-emerald-500',
    label: 'Delivered',
  },
  cancelled: {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-400/10',
    dot: 'bg-rose-500',
    label: 'Cancelled',
  },
  returned: {
    text: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-400/10',
    dot: 'bg-purple-500',
    label: 'Returned',
  },
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      const loaded = await fetchUserOrders();
      if (!cancelled) {
        setOrders(loaded);
        setLoadingOrders(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Handle URL query parameter ?tab=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && TABS.some(t => t.key === tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder || !cancelReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    try {
      const updated = await cancelOrderById(cancelModalOrder.id, cancelReason);
      setOrders(updated);
      setCancelModalOrder(null);
      setCancelReason('');
      toast.success(`Order ${cancelModalOrder.id} has been cancelled.`);
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'processing') {
      matchesTab = o.status === 'processing' || o.status === 'shipped';
    } else if (activeTab === 'delivery') {
      matchesTab = o.status === 'delivery' || o.status === 'delivered';
    } else if (activeTab !== 'all') {
      matchesTab = o.status === activeTab;
    }

    // Search filter
    const q = searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (q) {
      matchesSearch =
        o.id.toLowerCase().includes(q) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        o.productName.toLowerCase().includes(q);
    }

    return matchesTab && matchesSearch;
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-[#F6F6FB] to-[#FAFAFC] text-[#161623] transition-colors duration-300 dark:from-[#0B0B14] dark:to-[#121220] dark:text-[#F2F1FA]">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Orders</h1>
              <p className="mt-1.5 text-sm text-[#6E6E85] dark:text-[#8F8FA8]">
                Track, manage, and view details for all your placed orders.
              </p>
            </div>

            {/* Search input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search order ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-800 dark:bg-[#161623] dark:text-white"
              />
            </div>
          </div>

          {/* Segmented pill tabs */}
          <div className="mb-7 flex flex-wrap gap-1.5 rounded-2xl bg-[#ECEBF5] p-1.5 dark:bg-white/5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              let count = 0;
              if (tab.key === 'all') count = orders.length;
              else if (tab.key === 'processing') count = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;
              else if (tab.key === 'delivery') count = orders.filter(o => o.status === 'delivery' || o.status === 'delivered').length;
              else count = orders.filter(o => o.status === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#161623] shadow-sm dark:bg-indigo-600 dark:text-white'
                      : 'text-[#7C7C93] hover:text-[#161623] dark:text-[#7C7C93] dark:hover:text-[#E5E4F0]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-white/20 dark:text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Order list */}
          {loadingOrders ? (
            <div className="rounded-2xl border border-dashed border-[#D9D8E8] bg-white/50 py-16 text-center dark:border-[#2A2A3D] dark:bg-white/[0.02]">
              <Package className="mx-auto h-12 w-12 animate-pulse text-gray-400" />
              <p className="mt-3 text-base font-semibold text-gray-700 dark:text-gray-300">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D9D8E8] bg-white/50 py-16 text-center dark:border-[#2A2A3D] dark:bg-white/[0.02]">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-3 text-base font-semibold text-gray-700 dark:text-gray-300">No orders found</p>
              <p className="mt-1 text-xs text-[#8B8BA0] dark:text-[#7C7C93]">
                {searchQuery
                  ? `No orders matching "${searchQuery}"`
                  : `You have no ${activeTab === 'all' ? '' : activeTab} orders right now.`}
              </p>
              <Link
                href="/shopnow"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onViewDetails={() => setSelectedOrder(order)}
                  onOpenCancelModal={() => setCancelModalOrder(order)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#161623]">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="h-6 w-6" />
                <h3 className="text-lg font-bold">Cancel Order {cancelModalOrder.id}</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to cancel this order? Please select a reason below:
              </p>

              <div className="mt-4 space-y-2">
                {[
                  'Changed my mind',
                  'Ordered by mistake',
                  'Found a better price elsewhere',
                  'Delivery is taking too long',
                  'Wrong size or color selected',
                  'Other reason',
                ].map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm cursor-pointer transition ${
                      cancelReason === r
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-medium'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={r}
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="accent-indigo-600"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

function OrderRow({ order, onViewDetails, onOpenCancelModal }) {
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.processing;
  const isCancellable = order.status === 'processing';

  return (
    <li className="group rounded-2xl border border-[#ECEBF5] bg-white p-4 transition-all duration-200 hover:border-[#DCDBF2] hover:shadow-md dark:border-[#242438] dark:bg-[#161623] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: thumbnail + info */}
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <img
            src={order.image}
            alt={order.productName}
            className="h-20 w-20 shrink-0 rounded-xl border border-[#ECEBF5] object-cover dark:border-[#2A2A3D]"
          />

          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-[#9797AC] dark:text-[#75758F]">
              <span>{order.date}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <span>{order.time}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{order.id}</span>
            </div>

            <p className="truncate text-base font-bold text-[#161623] dark:text-[#F2F1FA]">
              {order.productName}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#F5F4FA] px-2 py-0.5 text-xs text-[#6E6E85] dark:bg-white/5 dark:text-[#B4B4C6]">
                Size: {order.size}
              </span>
              <span className="rounded-md bg-[#F5F4FA] px-2 py-0.5 text-xs text-[#6E6E85] dark:bg-white/5 dark:text-[#B4B4C6]">
                Color: {order.color}
              </span>
              <span className="rounded-md bg-[#F5F4FA] px-2 py-0.5 text-xs text-[#6E6E85] dark:bg-white/5 dark:text-[#B4B4C6]">
                Qty: {order.quantity}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold ${status.bg} ${status.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: total price + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-800 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-400">Total Amount</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{(order.total || order.price).toLocaleString('en-BD')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/ordertracking?orderId=${order.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Track</span>
            </Link>

            <button
              onClick={onViewDetails}
              className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 cursor-pointer"
            >
              Details
            </button>

            {isCancellable && (
              <button
                onClick={onOpenCancelModal}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function OrderDetailsModal({ order, onClose }) {
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.processing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#161623]">
        <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h3>
            <p className="text-xs text-indigo-600 font-semibold">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-white/5">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          {/* Product Info */}
          <div className="flex gap-4 rounded-xl border p-3 dark:border-gray-800">
            <img src={order.image} alt={order.productName} className="h-16 w-16 rounded-lg object-cover" />
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{order.productName}</p>
              <p className="text-xs text-gray-500">Size: {order.size} | Color: {order.color} | Qty: {order.quantity}</p>
              <p className="mt-1 font-semibold text-xs text-indigo-600">৳{order.price.toLocaleString('en-BD')}</p>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <span><strong>Address:</strong> {order.address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span><strong>Phone:</strong> {order.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
              <span><strong>Payment:</strong> {order.payment || 'Cash on Delivery'}</span>
            </div>
          </div>

          {/* Order Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tracking Timeline</h4>
              <div className="relative pl-6 space-y-4 border-l-2 border-indigo-100 dark:border-indigo-950">
                {order.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-[#161623]" />
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{item.label || item.step}</p>
                    <p className="text-[11px] text-gray-400">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-800">
          <Link
            href={`/ordertracking?orderId=${order.id}`}
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Track Order Progress
          </Link>
        </div>
      </div>
    </div>
  );
}