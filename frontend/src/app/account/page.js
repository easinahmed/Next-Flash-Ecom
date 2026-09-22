'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Pencil, X, Loader2, Package, ShoppingBag, XCircle, MapPin, User, Mail, Phone, CheckCircle } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { fetchUserOrders } from '@/services/ordersStore';
import Link from 'next/link';

export default function ManageAccountPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Snapshot used to restore values if the user clicks Cancel
  const [snapshot, setSnapshot] = useState({ fullName: '', phone: '', address: '' });

  // Account stats
  const [orderStats, setOrderStats] = useState({ total: 0, processing: 0, cancelled: 0, completed: 0 });

  // Load logged-in user info + any previously saved profile edits
  useEffect(() => {
    if (authLoading) return;

    const userEmail = user?.email || 'user@example.com';
    const userName = user ? `${user.firstName} ${user.lastName}` : '';
    const userPhone = user?.phone || '+880 1712-345678';
    const userAddress = user?.address || 'House 14, Road 7, Kafrul, Dhaka';

    const savedKey = `profileData_${user?.id || 'default'}`;
    const saved = JSON.parse(localStorage.getItem(savedKey) || '{}');

    const initialName = saved.fullName || userName || 'Guest User';
    const initialPhone = saved.phone || userPhone;
    const initialAddress = saved.address || userAddress;

    setFullName(initialName);
    setPhone(initialPhone);
    setAddress(initialAddress);
    setSnapshot({ fullName: initialName, phone: initialPhone, address: initialAddress });

    async function loadOrderStats() {
      const userOrders = await fetchUserOrders();
      const total = userOrders.length;
      const processing = userOrders.filter(o => o.status === 'processing' || o.status === 'shipped').length;
      const cancelled = userOrders.filter(o => o.status === 'cancelled').length;
      const completed = userOrders.filter(o => o.status === 'delivery' || o.status === 'delivered').length;

      setOrderStats({ total, processing, cancelled, completed });
      setLoading(false);
    }

    loadOrderStats();
  }, [user, authLoading]);

  const handleEditClick = () => {
    if (isEditing) {
      setFullName(snapshot.fullName);
      setPhone(snapshot.phone);
      setAddress(snapshot.address);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveChange = async () => {
    setIsSaving(true);
    const updated = { fullName, phone, address };

    try {
      const savedKey = `profileData_${user?.id || 'default'}`;
      localStorage.setItem(savedKey, JSON.stringify(updated));

      setSnapshot(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const initial = fullName?.trim()?.charAt(0)?.toUpperCase() || user?.firstName?.charAt(0)?.toUpperCase() || 'U';
  const accountImage = user?.image || '';

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        {/* Header Banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              {accountImage ? (
                <img
                  src={accountImage}
                  alt={fullName}
                  className="h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-md">
                  {initial}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <p className="text-sm text-gray-300">@{user?.username || 'user'}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-indigo-200">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEditClick}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md transition hover:bg-white/20 cursor-pointer"
            >
              {isEditing ? <X className="h-4 w-4 text-red-400" /> : <Pencil className="h-4 w-4" />}
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Quick Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link href="/myorder" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 transition hover:border-indigo-500 shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{orderStats.total}</p>
              </div>
            </div>
          </Link>

          <Link href="/myorder?tab=processing" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 transition hover:border-amber-500 shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{orderStats.processing}</p>
              </div>
            </div>
          </Link>

          <Link href="/myorder?tab=delivered" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 transition hover:border-emerald-500 shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{orderStats.completed}</p>
              </div>
            </div>
          </Link>

          <Link href="/mycancellation" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 transition hover:border-rose-500 shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{orderStats.cancelled}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Info Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <User className="h-4 w-4 text-gray-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                placeholder="Your full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-900/50"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-900/50"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>Gmail (Login Account)</span>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-400">
                This is your login email and cannot be modified.
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Default Shipping Address</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditing}
                placeholder="House, Road, Area, City"
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-900/50"
              />
            </div>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={handleSaveChange}
              disabled={isSaving}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}