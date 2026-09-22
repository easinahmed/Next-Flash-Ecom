'use client'

import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { LogIn, ShieldAlert } from 'lucide-react'

/**
 * Wraps a page to require authentication.
 * If the user is not logged in, shows a message and redirects to /signin.
 * 
 * Usage:
 *   import AuthGuard from '@/components/AuthGuard'
 *   export default function MyPage() {
 *     return <AuthGuard>...protected content...</AuthGuard>
 *   }
 */
export default function AuthGuard({ children }) {
  const { isLoggedIn, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        // Auto-redirect after 3 seconds
        const timer = setTimeout(() => {
          router.push('/signin')
        }, 3000)
        return () => clearTimeout(timer)
      } else if (isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [loading, isLoggedIn, isAdmin, router])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-red-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Not logged in — show access denied screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldAlert size={40} className="text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In Required</h1>
            <p className="text-gray-500 dark:text-gray-400">
              You need to be logged in to access this page. Please sign in to continue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
            >
              <LogIn size={18} />
              Sign In
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
            >
              Go Home
            </Link>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Redirecting to sign in page in a few seconds...
          </p>
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldAlert size={40} className="text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Restricted</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Admins cannot access standard user pages. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Logged in — render the protected content
  return children
}
