'use client';

import { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Truck, Home, Clock, XCircle, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { fetchUserOrders, fetchOrderById } from '@/services/ordersStore';

const STEP_ORDER = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

const STEP_ICONS = {
  placed: Package,
  confirmed: CheckCircle2,
  packed: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: Home,
  cancelled: XCircle,
};

const STEP_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | found | notfound | error
  const [order, setOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      const loaded = await fetchUserOrders();
      if (cancelled) return;

      setUserOrders(loaded);
      setLoadingOrders(false);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlOrderId = params.get('orderId');
        if (urlOrderId) {
          setQuery(urlOrderId);
          performTrack(urlOrderId, loaded);
        }
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const performTrack = async (searchId, list = userOrders) => {
    const trimmed = searchId.trim();
    if (!trimmed) {
      setStatus('error');
      setOrder(null);
      return;
    }

    setStatus('loading');

    const key = trimmed.toLowerCase();
    const foundLocal = list.find(
      (o) =>
        o.id.toLowerCase() === key ||
        (o.orderNumber && o.orderNumber.toLowerCase() === key) ||
        (o._id && String(o._id).toLowerCase() === key)
    );

    if (foundLocal) {
      setOrder(foundLocal);
      setStatus('found');
      return;
    }

    const fromApi = await fetchOrderById(trimmed);
    if (fromApi) {
      setOrder(fromApi);
      setStatus('found');
    } else {
      setOrder(null);
      setStatus('notfound');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performTrack(query);
  };

  const currentStep = order?.status === 'delivery' ? 'delivered' : order?.status;
  const isCancelled = order?.status === 'cancelled';
  const currentStepIndex = order ? STEP_ORDER.indexOf(currentStep) : -1;

  return (
      <div className="min-h-screen py-10 px-4 bg-gray-50 dark:bg-[#0B0B14] transition-colors">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">Track Your Order</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
              Enter your Order ID or select from your recent orders below
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="bg-white dark:bg-[#161623] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. ORD-58213)"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-[#0B0B14] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
              >
                {status === 'loading' ? 'Searching...' : 'Track Order'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-red-600 text-sm mt-3">Please enter an Order ID.</p>
            )}
          </form>

          {/* Quick pick user orders */}
          {userOrders.length > 0 && status !== 'found' && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#161623]">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Recent Orders</p>
              <div className="space-y-2">
                {userOrders.slice(0, 4).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setQuery(o.id);
                      performTrack(o.id);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-3 text-left transition hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-gray-800 dark:hover:bg-indigo-950/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={o.image} alt={o.productName} className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{o.id}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{o.productName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 capitalize">{o.status}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === 'notfound' && (
            <div className="bg-white dark:bg-[#161623] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                No order found with ID "{query}". Please double check the ID and try again.
              </p>
            </div>
          )}

          {status === 'found' && order && (
            <div className="bg-white dark:bg-[#161623] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 sm:p-6 space-y-6">
              {/* Order summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 dark:text-gray-400 text-xs">Order ID</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-400 text-xs">Order Date</p>
                  <p className="font-semibold text-black dark:text-white">{order.date}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-400 text-xs">Payment Method</p>
                  <p className="font-semibold text-black dark:text-white">{order.payment || 'Cash on Delivery'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-400 text-xs">Total Amount</p>
                  <p className="font-bold text-black dark:text-white">৳{(order.total || order.price).toLocaleString('en-BD')}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Shipping Address</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{order.address}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Phone: {order.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-gray-400 text-xs mb-2">Order Items</p>
                <div className="space-y-2">
                  {(order.items && order.items.length > 0 ? order.items : [{ name: order.productName, image: order.image, qty: order.quantity, size: order.size, color: order.color }]).map((item, idx) => (
                    <div key={`${item.name}-${idx}`} className="flex items-center gap-3">
                      <img src={item.image || order.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover border" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size ? `Size: ${item.size} | ` : ''}
                          {item.color ? `Color: ${item.color} | ` : ''}
                          Qty: {item.qty || 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current status badge */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-gray-400 text-xs mb-2">Current Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isCancelled
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                      : order.status === 'delivery' || order.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {STEP_LABELS[order.status] || order.status}
                </span>
                {isCancelled && order.cancelReason && (
                  <p className="text-xs text-rose-500 mt-1.5">Reason: {order.cancelReason}</p>
                )}
              </div>

              {/* Live Timeline */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-gray-400 text-xs mb-4">Tracking Timeline</p>
                <ol className="relative border-s-2 border-indigo-100 dark:border-indigo-950 ms-3 space-y-6">
                  {(order.timeline && order.timeline.length > 0
                    ? order.timeline
                    : STEP_ORDER.map(step => ({ step, label: STEP_LABELS[step], date: order.date }))
                  ).map((item, idx) => {
                    const stepName = item.step || 'placed';
                    const Icon = STEP_ICONS[stepName] || Clock;
                    return (
                      <li key={idx} className="ms-6">
                        <span
                          className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ring-4 ring-white dark:ring-[#161623] bg-indigo-600 text-white`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.label || STEP_LABELS[stepName] || stepName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.date}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}