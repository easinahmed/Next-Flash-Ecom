'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'flash-shoe-cart'

function normalizeItem(item) {
  return {
    ...item,
    id: item.id || `${item.name || item.title}-${typeof item.image === 'string' ? item.image : item.image?.src || item.thumbnail}-${item.price}`,
    name: item.name || item.title || 'Product',
    image: typeof item.image === 'string' ? item.image : item.image?.src || item.thumbnail || '/shoe1.avif',
    price: typeof item.price === 'number' ? item.price : Number.parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0,
  }
}

function readStoredCart() {
  if (typeof window === 'undefined') return { stoppingItems: [], cartItems: [], wishlistItems: [] }

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      stoppingItems: Array.isArray(stored.stoppingItems) ? stored.stoppingItems.map(normalizeItem) : [],
      cartItems: Array.isArray(stored.cartItems) ? stored.cartItems.map(normalizeItem) : [],
      wishlistItems: Array.isArray(stored.wishlistItems) ? stored.wishlistItems.map(normalizeItem) : [],
    }
  } catch {
    return { stoppingItems: [], cartItems: [], wishlistItems: [] }
  }
}

export function CartProvider({ children }) {
  const [stoppingItems, setStoppingItems] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const storedCart = readStoredCart()
    setStoppingItems(storedCart.stoppingItems)
    setCartItems(storedCart.cartItems)
    setWishlistItems(storedCart.wishlistItems)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ stoppingItems, cartItems, wishlistItems }))
  }, [stoppingItems, cartItems, wishlistItems, isLoaded])

  const addToStoppingCart = (product) => {
    const norm = normalizeItem(product)
    const item = {
      ...norm,
      qty: product.qty || 1,
    }

    setStoppingItems((currentItems) => {
      const existingItem = currentItems.find((currentItem) => String(currentItem.id) === String(item.id))
      if (existingItem) {
        return currentItems.map((currentItem) => String(currentItem.id) === String(item.id)
          ? { ...currentItem, qty: currentItem.qty + (product.qty || 1) }
          : currentItem)
      }
      return [...currentItems, item]
    })
  }

  const updateStoppingQuantity = (id, direction) => {
    setStoppingItems((currentItems) => currentItems.map((item) => String(item.id) !== String(id)
      ? item
      : { ...item, qty: Math.max(1, item.qty + (direction === 'inc' ? 1 : -1)) }))
  }

  const removeStoppingItem = (id) => {
    setStoppingItems((currentItems) => currentItems.filter((item) => String(item.id) !== String(id)))
  }

  const checkoutStoppingItems = () => {
    setCartItems((currentItems) => {
      const nextItems = [...currentItems]
      stoppingItems.forEach((stoppingItem) => {
        const existingItem = nextItems.find((item) => String(item.id) === String(stoppingItem.id))
        if (existingItem) {
          existingItem.qty += stoppingItem.qty
        } else {
          nextItems.push(stoppingItem)
        }
      })
      return nextItems
    })
    setStoppingItems([])
  }

  const updateCartQuantity = (id, direction) => {
    setCartItems((currentItems) => currentItems.map((item) => String(item.id) !== String(id)
      ? item
      : { ...item, qty: Math.max(1, item.qty + (direction === 'inc' ? 1 : -1)) }))
  }

  const removeCartItem = (id) => {
    setCartItems((currentItems) => currentItems.filter((item) => String(item.id) !== String(id)))
  }

  const toggleWishlist = (product) => {
    const item = normalizeItem(product)

    setWishlistItems((currentItems) => currentItems.some((currentItem) => String(currentItem.id) === String(item.id))
      ? currentItems.filter((currentItem) => String(currentItem.id) !== String(item.id))
      : [...currentItems, item])
  }

  const isItemInCart = (id) => {
    if (!id) return false
    return stoppingItems.some((item) => String(item.id) === String(id)) || cartItems.some((item) => String(item.id) === String(id))
  }

  const toggleCartItem = (product) => {
    if (!product) return
    const norm = normalizeItem(product)
    const itemId = String(norm.id)
    if (isItemInCart(itemId)) {
      setStoppingItems((items) => items.filter((item) => String(item.id) !== itemId))
      setCartItems((items) => items.filter((item) => String(item.id) !== itemId))
    } else {
      addToStoppingCart(product)
    }
  }

  const isWishlisted = (id) => wishlistItems.some((item) => String(item.id) === String(id))
  const removeAllWishlistItems = () => setWishlistItems([])

  const clearCart = () => {
    setCartItems([])
    setStoppingItems([])
  }

  const value = useMemo(() => ({
    stoppingItems,
    cartItems,
    addToStoppingCart,
    updateStoppingQuantity,
    removeStoppingItem,
    checkoutStoppingItems,
    updateCartQuantity,
    removeCartItem,
    wishlistItems,
    toggleWishlist,
    isWishlisted,
    isItemInCart,
    toggleCartItem,
    removeAllWishlistItems,
    clearCart,
    stoppingCount: stoppingItems.reduce((sum, item) => sum + item.qty, 0),
    cartCount: cartItems.reduce((sum, item) => sum + item.qty, 0),
    wishlistCount: wishlistItems.length,
  }), [stoppingItems, cartItems, wishlistItems])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
