"use client";

import { useState, useMemo, useEffect } from "react";
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { fetchUserOrders, cancelOrderById } from '@/services/ordersStore';
import {
  Phone,
  Search,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  PackageCheck
} from "lucide-react";
import Image from "next/image";
import WhatsappLogo from "@/images/whatsapplogo.webp";

const COMPANY_PHONE_DISPLAY = "09612-345 678";
const COMPANY_PHONE_TEL = "+8809612345678";
const WHATSAPP_NUMBER = "8801234567890";
const WHATSAPP_MESSAGE = "Hi, I'd like help cancelling my order.";

const CANCEL_REASONS = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Delivery is taking too long",
  "Wrong size or color selected",
  "No longer need the item",
  "Payment or billing issue",
  "Other reason",
];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium px-2.5 py-1 dark:bg-indigo-950 dark:text-indigo-300">
      {children}
    </span>
  );
}

export default function OrderCancelPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [visibleOrders, setVisibleOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchError, setSearchError] = useState("");
  const [modalOrder, setModalOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [confirmedToast, setConfirmedToast] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      const loaded = await fetchUserOrders();
      if (cancelled) return;
      setOrders(loaded);
      setVisibleOrders(loaded);
      setLoadingOrders(false);
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleSearch(e) {
    e.preventDefault();
    const key = query.trim().toUpperCase();
    if (!key) {
      setVisibleOrders(orders);
      setSearchError("");
      return;
    }
    const match = orders.filter((o) => 
      o.id.toUpperCase().includes(key) || 
      (o.orderNumber && o.orderNumber.toUpperCase().includes(key)) ||
      o.productName.toUpperCase().includes(key)
    );

    if (match.length) {
      setVisibleOrders(match);
      setSearchError("");
    } else {
      setVisibleOrders([]);
      setSearchError(`No order found for "${query.trim()}". Check the number and try again.`);
    }
  }

  function openCancelModal(order) {
    setReason("");
    setModalOrder(order);
  }

  async function confirmCancel() {
    if (!reason || !modalOrder) return;

    try {
      const updated = await cancelOrderById(modalOrder.id, reason);
      setOrders(updated);

      if (query.trim()) {
        const key = query.trim().toUpperCase();
        setVisibleOrders(updated.filter((o) =>
          o.id.toUpperCase().includes(key) ||
          (o.orderNumber && o.orderNumber.toUpperCase().includes(key)) ||
          o.productName.toUpperCase().includes(key)
        ));
      } else {
        setVisibleOrders(updated);
      }

      setModalOrder(null);
      setReason("");
      setConfirmedToast(true);
      setTimeout(() => setConfirmedToast(false), 3000);
    } catch (err) {
      setSearchError(err.message || 'Failed to cancel order');
    }
  }

  const waHref = useMemo(
    () => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
    []
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-stone-50 dark:bg-[#0B0B14] transition-colors py-10">
        <div className="mx-auto max-w-2xl px-5 sm:px-6">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white">
              Cancel an Order
            </h1>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
              Select any processing order below to request immediate cancellation, or reach out to our team.
            </p>
          </div>

          {/* Contact options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a
              href={`tel:${COMPANY_PHONE_TEL}`}
              className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-[#161623] dark:text-white p-4 hover:border-stone-300 transition-colors shadow-sm"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-50 grid place-items-center text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Phone size={16} />
              </div>
              <div className="mt-4">
                <p className="text-xs text-stone-500 dark:text-gray-400">Call customer care</p>
                <p className="text-[15px] font-medium mt-0.5 tabular-nums">{COMPANY_PHONE_DISPLAY}</p>
              </div>
            </a>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-[#161623] dark:text-white p-4 hover:border-emerald-300 transition-colors shadow-sm"
            >
              <div className="w-9 h-9 rounded-full grid place-items-center">
                <Image src={WhatsappLogo} alt="WhatsApp" className="w-8 h-8" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-stone-500 dark:text-gray-400">WhatsApp Support</p>
                  <p className="text-[15px] font-medium mt-0.5">Chat Directly</p>
                </div>
                <ChevronRight size={16} className="text-stone-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-stone-200 dark:bg-gray-800" />
            <span className="text-xs text-stone-400">or search order ID</span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-gray-800" />
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. ORD-58213"
                className="w-full rounded-xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-[#161623] dark:text-white pl-10 pr-3 py-2.5 text-sm placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-shadow"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-stone-900 dark:bg-indigo-600 text-white text-sm font-medium px-5 hover:bg-stone-700 dark:hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {searchError && (
            <p className="text-sm text-red-600 mt-2 mb-4">{searchError}</p>
          )}

          {/* Recent / searched orders */}
          {visibleOrders.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-medium text-stone-400 mb-3">
                {query.trim() ? "Search results" : "Your Orders & Cancellations"}
              </p>

              <div className="space-y-3">
                {visibleOrders.map((order) => {
                  const isCancelled = order.status === 'cancelled';
                  const isCancellable = order.status === 'processing';

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-[#161623] dark:text-white shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <img
                        src={order.image || order.img}
                        alt={order.productName || order.product}
                        className="w-16 h-16 shrink-0 rounded-2xl bg-indigo-50 border border-stone-200 dark:border-gray-800 object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-stone-400 flex flex-wrap items-center gap-x-1.5">
                          <span>{order.date}</span>
                          <span className="opacity-50">·</span>
                          <span>{order.time}</span>
                          <span className="opacity-50">·</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{order.id}</span>
                        </p>
                        <p className="text-[15px] font-semibold mt-1 truncate">{order.productName || order.product}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Pill>Size: {order.size}</Pill>
                          <Pill>Color: {order.color}</Pill>
                          <Pill>Qty: {order.quantity || order.qty}</Pill>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t pt-2 sm:border-0 sm:pt-0 dark:border-gray-800">
                        <span className="text-base font-semibold tabular-nums">
                          ৳{(order.total || order.price).toLocaleString('en-BD')}
                        </span>
                        {isCancelled ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                              <CheckCircle2 size={14} /> Cancelled
                            </span>
                            {order.cancelReason && (
                              <p className="text-[10px] text-gray-400 max-w-[150px] truncate">{order.cancelReason}</p>
                            )}
                          </div>
                        ) : isCancellable ? (
                          <button
                            onClick={() => openCancelModal(order)}
                            className="inline-flex items-center gap-1 rounded-xl bg-stone-900 dark:bg-rose-600 text-white text-xs font-semibold px-4 py-2 hover:bg-stone-700 dark:hover:bg-rose-700 transition-colors cursor-pointer"
                          >
                            Cancel Order
                            <ChevronRight size={14} />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <PackageCheck size={14} /> Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-stone-200 py-12 text-center text-stone-400 dark:border-gray-800">
              <p className="text-sm">No orders found.</p>
            </div>
          )}
        </div>

        {/* Cancel reason modal */}
        {modalOrder && (
          <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#161623] border border-stone-200 dark:border-gray-800 p-5 shadow-2xl">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Why cancel this order?</h3>
                <button
                  onClick={() => setModalOrder(null)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-indigo-600 font-semibold mb-4 truncate">
                Order ID: {modalOrder.id}
              </p>

              <div className="space-y-1.5 mb-5 max-h-60 overflow-y-auto pr-1">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className={
                      "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs cursor-pointer transition-colors dark:text-gray-200 " +
                      (reason === r
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 font-semibold"
                        : "border-stone-200 hover:bg-stone-50 dark:border-gray-800 dark:hover:bg-gray-800")
                    }
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-indigo-600"
                    />
                    {r}
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setModalOrder(null)}
                  className="flex-1 rounded-xl border border-stone-200 dark:border-gray-700 text-xs font-semibold py-2.5 hover:bg-stone-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={!reason}
                  className="flex-1 rounded-xl bg-rose-600 text-white text-xs font-semibold py-2.5 hover:bg-rose-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation toast */}
        {confirmedToast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-stone-900 text-white text-sm font-medium px-4 py-2.5 shadow-lg">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Order successfully cancelled
          </div>
        )}
      </div>
    </AuthGuard>
  );
}