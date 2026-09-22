'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { getOrders, updateOrder, updateOrderStatus } from '@/lib/api';
import { ShoppingBag, Search, Truck, RefreshCw, X, Save, UserRound, MapPin, Phone, Mail, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [savingFee, setSavingFee] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders();
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setDeliveryFee(String(order.deliveryFee ?? 0));
  };

  const handleSaveDeliveryFee = async () => {
    if (!selectedOrder) return;
    const fee = Number(deliveryFee);
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error('Enter a valid delivery charge');
      return;
    }

    setSavingFee(true);
    try {
      const updated = await updateOrder(selectedOrder._id, { deliveryFee: fee });
      setOrders((prev) => prev.map((order) => (order._id === updated._id ? updated : order)));
      setSelectedOrder(updated);
      setDeliveryFee(String(updated.deliveryFee ?? fee));
      toast.success('Delivery charge updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update delivery charge');
    } finally {
      setSavingFee(false);
    }
  };

  const handleDetailsStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      const updated = await updateOrderStatus(selectedOrder._id, newStatus);
      setOrders((prev) => prev.map((order) => (order._id === updated._id ? updated : order)));
      setSelectedOrder(updated);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const id = (o.orderId || o._id || o.orderNumber || '').toLowerCase();
    const customer = (o.customerName || o.customer?.fullName || o.customer?.email || o.phone || '').toLowerCase();
    return id.includes(q) || customer.includes(q);
  });

  return (
    <AdminLayout activeSection="Orders">
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Orders</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review, track, and update order fulfillment statuses.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/courier"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>Courier Dispatch</span>
            </Link>
            <button
              onClick={loadOrders}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Orders
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-800 dark:bg-[#161623] dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-[#161623] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mt-6 shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading orders...</div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Current Status</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredOrders.map((o) => {
                    const mongoId = o._id;
                    const displayId = o.orderId || o.orderNumber || mongoId;
                    const customerName = o.customerName || o.customer?.fullName || o.customer?.email || 'Guest Customer';
                    const total = o.totalAmount || o.total || o.price || 0;
                    const currentStatus = o.status || 'Processing';
                    const phone = o.phone || o.customer?.phone || o.shippingAddress?.phone;

                    return (
                      <tr key={mongoId || displayId} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition">
                        <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                          <button onClick={() => openOrderDetails(o)} className="hover:underline cursor-pointer" title="View order details">
                            {displayId}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{customerName}</div>
                          {phone && <div className="text-xs text-gray-400">{phone}</div>}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          ৳{total.toLocaleString('en-BD')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            currentStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : currentStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                              : currentStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {currentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openOrderDetails(o)}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950"
                              title="View order details"
                            >
                              <Package className="h-3.5 w-3.5" /> Details
                            </button>
                            {STATUS_OPTIONS.map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(mongoId, st)}
                                disabled={currentStatus === st}
                                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                                  currentStatus === st
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black font-bold'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
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

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelectedOrder(null)}>
            <section className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-[#121220]" onClick={(event) => event.stopPropagation()} aria-label="Order details">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Order details</p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{selectedOrder.orderId || selectedOrder._id}</h2>
                  <p className="mt-1 text-xs text-gray-500">Placed {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Date unavailable'}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Close details"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"><UserRound className="h-4 w-4 text-indigo-600" /> Customer</h3>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.customerName || selectedOrder.customer?.fullName || 'Guest Customer'}</p>
                  {(selectedOrder.phone || selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone) && <p className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Phone className="h-3.5 w-3.5" /> {selectedOrder.phone || selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone}</p>}
                  {(selectedOrder.email || selectedOrder.customer?.email || selectedOrder.shippingAddress?.email) && <p className="mt-2 flex items-center gap-2 break-all text-sm text-gray-600 dark:text-gray-300"><Mail className="h-3.5 w-3.5" /> {selectedOrder.email || selectedOrder.customer?.email || selectedOrder.shippingAddress?.email}</p>}
                </div>
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"><MapPin className="h-4 w-4 text-indigo-600" /> Delivery address</h3>
                  <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">{[selectedOrder.shippingAddress?.address || selectedOrder.deliveryAddress, selectedOrder.shippingAddress?.thana, selectedOrder.shippingAddress?.district].filter(Boolean).join(', ') || 'Address unavailable'}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Payment: {selectedOrder.paymentMethod || 'Cash on delivery'}</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800"><h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"><Package className="h-4 w-4 text-indigo-600" /> Ordered products</h3><span className="text-xs text-gray-500">{selectedOrder.items?.length || 0} item(s)</span></div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex gap-3 p-4">
                      <img src={item.image || '/shoe1.avif'} alt="" className="h-16 w-16 rounded-lg bg-gray-100 object-cover" />
                      <div className="min-w-0 flex-1"><p className="font-semibold text-gray-900 dark:text-white">{item.name}</p><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500"><span>Qty: {item.quantity}</span><span>Colour: {item.color || 'Not selected'}</span><span>Size: {item.size || 'Not selected'}</span></div></div>
                      <p className="font-bold text-gray-900 dark:text-white">৳{(item.price * item.quantity).toLocaleString('en-BD')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>৳{(selectedOrder.subtotal || 0).toLocaleString('en-BD')}</span></div>
                <div className="mt-3 flex items-end justify-between gap-4"><label className="text-sm font-semibold text-gray-900 dark:text-white" htmlFor="delivery-fee">Delivery charge</label><div className="flex items-center gap-2"><input id="delivery-fee" type="number" min="0" step="1" value={deliveryFee} onChange={(event) => setDeliveryFee(event.target.value)} disabled={['Shipped', 'Delivered', 'Cancelled'].includes(selectedOrder.status)} className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-right text-sm outline-none focus:border-indigo-600 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:disabled:bg-gray-800" /><button onClick={handleSaveDeliveryFee} disabled={savingFee || ['Shipped', 'Delivered', 'Cancelled'].includes(selectedOrder.status)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" title="Save delivery charge"><Save className="h-3.5 w-3.5" /> {savingFee ? 'Saving' : 'Save'}</button></div></div>
                <div className="mt-4 flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-white"><span>Total</span><span>৳{(selectedOrder.total || 0).toLocaleString('en-BD')}</span></div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{STATUS_OPTIONS.map((status) => <button key={status} onClick={() => handleDetailsStatusChange(status)} disabled={selectedOrder.status === status} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:bg-gray-900 disabled:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:bg-white dark:disabled:text-black">{status}</button>)}</div><Link href="/courier" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"><Truck className="h-3.5 w-3.5" /> Courier dispatch</Link></div>
            </section>
          </div>
        )}
      </>
    </AdminLayout>
  );
}
