'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CheckCircle2,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Landmark,
  Wallet,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { fetchOrderById } from '@/services/ordersStore';

const paymentLabels = {
  cod: 'Cash on Delivery',
  'cash-on-delivery': 'Cash on Delivery',
  online: 'Online Payment',
  bkash: 'bKash',
  nagad: 'Nagad',
};

function normalizeSessionOrder(saved) {
  if (!saved) return null;
  return {
    ...saved,
    orderId: saved.orderId || saved.id,
    mobile: saved.mobile || saved.phone,
    deliveryCost: saved.deliveryCost ?? saved.deliveryFee,
    productImage: saved.productImage || saved.items?.[0]?.image || saved.image,
    productName: saved.productName || saved.items?.[0]?.name,
  };
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(30);

  const total = order ? (order.total ?? (order.subtotal || 0) + (order.deliveryCost || 0) - (order.discount || 0)) : 0;
  const isDhaka = (order?.district || 'dhaka').trim().toLowerCase() === 'dhaka';

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      const params = new URLSearchParams(window.location.search);
      const urlOrderId = params.get('orderId');
      const savedRaw = sessionStorage.getItem('flashShoeOrder');
      let saved = null;

      if (savedRaw) {
        try {
          saved = JSON.parse(savedRaw);
          const parsed = normalizeSessionOrder(saved);
          if (!cancelled && parsed) setOrder(parsed);
        } catch {
          saved = null;
        }
      }

      const lookupId = urlOrderId || saved?.orderId || saved?._id;
      if (lookupId) {
        const fromApi = await fetchOrderById(lookupId);
          setOrder((prev) => ({
            ...(prev || {}),
            orderId: fromApi.id,
            _id: fromApi._id,
            customerName: fromApi.customerName || prev?.customerName,
            mobile: fromApi.phone || prev?.mobile,
            phone: fromApi.phone || prev?.phone,
            email: fromApi.email || prev?.email || '',
            address: fromApi.address || prev?.address,
            district: fromApi.district || prev?.district || prev?.shippingAddress?.district || '',
            thana: fromApi.thana || prev?.thana || prev?.shippingAddress?.thana || '',
            paymentMethod: fromApi.paymentMethod || prev?.paymentMethod,
            subtotal: fromApi.subtotal,
            deliveryCost: fromApi.deliveryFee,
            discount: fromApi.discount,
            total: fromApi.total,
            productImage: fromApi.image,
            productName: fromApi.productName,
            quantity: fromApi.quantity,
            items: fromApi.items,
          }));
      }

      if (!cancelled) setLoading(false);
    }

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || !order) return;
    if (secondsLeft <= 0) {
      router.push('/');
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, router, loading, order]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-green-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No order to show</h1>
          <p className="text-sm text-gray-500">Place an order from your cart to see confirmation details.</p>
          <Link href="/cart" className="inline-block mt-2 text-indigo-600 font-semibold">Go to cart</Link>
        </div>
      </div>
    );
  }

  const targetOrderId = order.orderId || order.id;
  const district = order.district || order.shippingAddress?.district || '';
  const thana = order.thana || order.shippingAddress?.thana || '';

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/20 px-6 py-8 text-center border-b border-green-100 dark:border-green-900/40">
            <CheckCircle2 className="w-14 h-14 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Your order is complete!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
              Very soon you will receive your desired order.{' '}
              {isDhaka ? (
                <>Your order will be delivered within <span className="font-semibold">72 hours</span> as you are inside Dhaka.</>
              ) : (
                <>Your order will be delivered within <span className="font-semibold">72 hours</span> inside Dhaka, and it may take a bit longer outside Dhaka.</>
              )}
            </p>

            <Link href={`/ordertracking?orderId=${targetOrderId}`}>
              <button
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors cursor-pointer shadow-md"
              >
                <Truck className="w-4 h-4" />
                Track Order
              </button>
            </Link>
          </div>

          <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100 dark:border-neutral-800">
            <div className="relative w-20 h-20 border-1 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0">
              <Image
                src={order.productImage || order.image || '/shoe1.avif'}
                alt={order.productName || 'Product'}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400">{targetOrderId}</p>
              {order.productName && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {order.productName}
                  {order.quantity ? (
                    <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Qty: {order.quantity}
                    </span>
                  ) : null}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-3 border-b border-gray-100 dark:border-neutral-800">
            <InfoRow icon={User} label="Name" value={order.customerName} />
            <InfoRow icon={Phone} label="Mobile" value={order.mobile || order.phone} />
            <InfoRow icon={Mail} label="Email" value={order.email?.trim() ? order.email : 'Not provided'} />
            <InfoRow icon={MapPin} label="Address" value={order.address} />
            <InfoRow icon={Landmark} label="District / Thana" value={`${district || 'Dhaka'}${thana ? `, ${thana}` : ''}`} />
            <InfoRow icon={Wallet} label="Payment Method" value={paymentLabels[order.paymentMethod] || order.paymentMethod || 'Cash on Delivery'} />
          </div>

          <div className="px-6 py-5 space-y-2 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span>৳{(order.subtotal || order.price || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Delivery Cost</span>
              <span>৳{(order.deliveryCost || 60).toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Discount</span>
                <span>-৳{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-dashed border-gray-200 dark:border-neutral-700">
              <span>Total Amount</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="px-6 py-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Back to Home ({secondsLeft})
            </button>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              You will be automatically redirected to the homepage.
            </p>
          </div>
        </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
