'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser as apiLogin, registerUser as apiRegister, googleLogin as apiGoogleLogin, getMe as apiGetMe } from '@/lib/api'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'flash-shoe-auth'

function readStoredAuth() {
  if (typeof window === 'undefined') return null
  try {
    const stored = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || 'null')
    if (stored && stored.token && stored.user) {
      return stored
    }
    return null
  } catch {
    return null
  }
}

function saveAuth(authData) {
  if (typeof window === 'undefined') return
  if (authData) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Restore auth on mount & verify token
  useEffect(() => {
    const stored = readStoredAuth()
    if (stored?.user) {
      setUser(stored.user)
      apiGetMe()
        .then((u) => {
          if (u) {
            const updatedUser = {
              id: u._id,
              _id: u._id,
              fullName: u.fullName,
              email: u.email,
              phone: u.phone,
              address: u.address,
              role: u.role,
              avatar: u.avatar,
              firstName: u.fullName ? u.fullName.split(' ')[0] : 'User',
              lastName: u.fullName ? u.fullName.split(' ').slice(1).join(' ') : '',
              image: u.avatar || '/shoe1.avif',
            }
            setUser(updatedUser)
            saveAuth({ user: updatedUser, token: stored.token })
          }
        })
        .catch(() => {
          // Keep stored if server offline
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiLogin(email, password)
      const userData = {
        id: data._id,
        _id: data._id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: data.role,
        avatar: data.avatar,
        firstName: data.fullName ? data.fullName.split(' ')[0] : 'User',
        lastName: data.fullName ? data.fullName.split(' ').slice(1).join(' ') : '',
        image: data.avatar || '/shoe1.avif',
      }
      const authData = { user: userData, token: data.token }
      saveAuth(authData)
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const signup = useCallback(async (formData) => {
    try {
      const data = await apiRegister(formData)
      const userData = {
        id: data._id,
        _id: data._id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: data.role,
        avatar: data.avatar,
        firstName: data.fullName ? data.fullName.split(' ')[0] : 'User',
        lastName: data.fullName ? data.fullName.split(' ').slice(1).join(' ') : '',
        image: data.avatar || '/shoe1.avif',
      }
      const authData = { user: userData, token: data.token }
      saveAuth(authData)
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const loginWithGoogle = useCallback(async (googlePayload) => {
    try {
      const data = await apiGoogleLogin(googlePayload)
      const userData = {
        id: data._id,
        _id: data._id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: data.role,
        avatar: data.avatar,
        firstName: data.fullName ? data.fullName.split(' ')[0] : 'User',
        lastName: data.fullName ? data.fullName.split(' ').slice(1).join(' ') : '',
        image: data.avatar || '/shoe1.avif',
      }
      const authData = { user: userData, token: data.token }
      saveAuth(authData)
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(() => {
    saveAuth(null)
    setUser(null)
    router.push('/signin')
  }, [router])

  const isLoggedIn = !!user
  const isAdmin = ['admin', 'moderator'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn, isAdmin, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
