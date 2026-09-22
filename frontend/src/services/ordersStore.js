'use client'

import { getOrders, getOrderById, updateOrderStatus } from '@/lib/api'

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  'cash-on-delivery': 'Cash on Delivery',
  online: 'Online Payment',
  bkash: 'bKash',
  nagad: 'Nagad',
}

function normalizeStatus(status) {
  const value = (status || 'Processing').toLowerCase()
  if (value === 'processing' || value === 'pending' || value === 'confirmed') return 'processing'
  if (value === 'shipped') return 'shipped'
  if (value === 'delivered') return 'delivery'
  if (value === 'cancelled') return 'cancelled'
  return 'processing'
}

function normalizePaymentMethod(method) {
  const value = (method || 'cash-on-delivery').toLowerCase()
  if (value === 'cash-on-delivery') return 'cod'
  return value
}

function formatOrderDate(dateValue) {
  const date = new Date(dateValue || Date.now())
  return {
    date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}

function buildTimeline(apiOrder, status) {
  const { date, time } = formatOrderDate(apiOrder.createdAt)
  const placed = { step: 'placed', label: 'Order placed', date: `${date} · ${time}` }
  const timeline = [placed]

  if (status === 'processing' || status === 'shipped' || status === 'delivery') {
    timeline.push({ step: 'confirmed', label: 'Order confirmed', date: `${date} · ${time}` })
  }
  if (status === 'shipped' || status === 'delivery') {
    timeline.push({ step: 'shipped', label: 'Shipped', date: `${date} · ${time}` })
  }
  if (status === 'delivery') {
    timeline.push({ step: 'delivered', label: 'Delivered', date: `${date} · ${time}` })
  }
  if (status === 'cancelled') {
    timeline.push({ step: 'cancelled', label: 'Cancelled', date: `${date} · ${time}` })
  }

  return timeline
}

export function mapApiOrderToFrontend(apiOrder) {
  const firstItem = apiOrder.items?.[0] || {}
  const totalQty = (apiOrder.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0) || 1
  const status = normalizeStatus(apiOrder.status)
  const { date, time } = formatOrderDate(apiOrder.createdAt)
  const shipping = apiOrder.shippingAddress || {}
  const paymentMethod = normalizePaymentMethod(apiOrder.paymentMethod)
  const orderId = apiOrder.orderId || apiOrder._id

  return {
    id: orderId,
    _id: apiOrder._id,
    orderNumber: String(orderId).replace(/^ORD-/i, ''),
    date,
    time,
    status,
    price: apiOrder.total || 0,
    quantity: totalQty,
    size: firstItem.size || '',
    color: firstItem.color || '',
    productName: firstItem.name || 'Order',
    image: firstItem.image || '/shoe1.avif',
    address: apiOrder.deliveryAddress || [shipping.address, shipping.thana, shipping.district].filter(Boolean).join(', '),
    district: shipping.district || '',
    thana: shipping.thana || '',
    phone: apiOrder.phone || shipping.phone || '',
    email: apiOrder.email || shipping.email || '',
    payment: PAYMENT_LABELS[paymentMethod] || PAYMENT_LABELS[apiOrder.paymentMethod] || 'Cash on Delivery',
    paymentMethod,
    subtotal: apiOrder.subtotal || 0,
    deliveryFee: apiOrder.deliveryFee ?? apiOrder.deliveryCost ?? 0,
    discount: apiOrder.discount || 0,
    total: apiOrder.total || 0,
    customerName: apiOrder.customerName || shipping.fullName || '',
    cancelReason: apiOrder.cancelReason || '',
    notes: apiOrder.notes || '',
    timeline: buildTimeline(apiOrder, status),
    items: (apiOrder.items || []).map((item) => ({
      name: item.name,
      qty: item.quantity || 1,
      price: item.price || 0,
      image: item.image || '/shoe1.avif',
      size: item.size || '',
      color: item.color || '',
    })),
  }
}

export async function fetchUserOrders() {
  try {
    const orders = await getOrders()
    return (Array.isArray(orders) ? orders : []).map(mapApiOrderToFrontend)
  } catch (err) {
    console.error('fetchUserOrders error:', err)
    return []
  }
}

export async function fetchOrderById(orderId) {
  const apiOrder = await getOrderById(orderId)
  return apiOrder ? mapApiOrderToFrontend(apiOrder) : null
}

/** @deprecated Use fetchUserOrders instead */
export function getStoredOrders() {
  return []
}

export async function cancelOrderById(orderId, reason) {
  const orders = await fetchUserOrders()
  const order = orders.find(
    (entry) =>
      entry.id === orderId ||
      entry._id === orderId ||
      (entry.orderNumber && entry.orderNumber === orderId)
  )

  if (!order?._id) {
    throw new Error('Order not found')
  }

  await updateOrderStatus(order._id, 'Cancelled', { cancelReason: reason || '' })
  return fetchUserOrders()
}

export function addOrderToStore(newOrder) {
  return [mapApiOrderToFrontend(newOrder)]
}
