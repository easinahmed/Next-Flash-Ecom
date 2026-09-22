'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminRouteGuard({ children }) {
  const { user, loading, isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isLoggedIn || !isAdmin)) {
      router.push('/signin');
    }
  }, [loading, isLoggedIn, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Admin Access Required</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            You must be logged in with an administrator account to access the control panel.
          </p>
          <Link
            href="/signin"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
          >
            Sign In as Admin
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
