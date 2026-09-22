'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { useAuth } from '@/components/AuthContext'
import CmsPageOverride from '@/components/CmsPageOverride'

const ADMIN_ROUTES = ['/categories', '/brand-management', '/cms', '/courier', '/customers', '/dashboard', '/inventory', '/orders', '/products', '/reviews', '/settings']

export default function LayoutInner({ children }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isAdminRoute = ADMIN_ROUTES.some(route => pathname?.startsWith(route))

  return (
    <>
      {!isAdminRoute && <Navbar currentUser={user} onLogout={logout} />}
      <CmsPageOverride>{children}</CmsPageOverride>
      {!isAdminRoute && <Footer />}
    </>
  )
}
