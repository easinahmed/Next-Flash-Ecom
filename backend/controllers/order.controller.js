const mongoose = require('mongoose');
const Order = require('../models/Order');

const ALLOWED_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'pending', 'confirmed'];

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === String(value);
}

async function findOrderByParam(id) {
  if (isObjectId(id)) {
    const byMongoId = await Order.findById(id);
    if (byMongoId) return byMongoId;
  }
  return Order.findOne({ orderId: id });
}

function ownsOrder(req, order) {
  if (!req.user || !order) return false;
  const userId = req.user._id.toString();
  if (order.customer && order.customer.toString() === userId) return true;
  if (order.customerId && order.customerId === userId) return true;
  if (req.user.email && order.email && req.user.email === order.email) return true;
  if (req.user.phone && order.phone && req.user.phone === order.phone) return true;
  return false;
}

const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      items,
      subtotal,
      deliveryCost,
      deliveryFee,
      discount,
      total,
      customerName,
      mobile,
      phone,
      email,
      address,
      district,
      thana,
      shippingAddress,
      paymentMethod,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const mappedItems = items.map((i) => ({
      productId: String(i.id || i.productId || i._id || `prod_${Date.now()}`),
      name: i.name || i.title || 'Product',
      image: i.image || (i.images && i.images[0]) || '/shoe1.avif',
      price: Number(i.price || 0),
      quantity: Number(i.qty || i.quantity || 1),
      size: i.size || '',
      color: i.color || '',
    }));

    const calcSubtotal = subtotal || mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = deliveryCost ?? deliveryFee ?? 70;
    const finalTotal = total || (calcSubtotal + fee - (discount || 0));

    const finalShippingAddress = shippingAddress || {
      fullName: customerName || '',
      phone: phone || mobile || '',
      email: email || '',
      address: address || '',
      district: district || '',
      thana: thana || '',
    };

    const order = await Order.create({
      orderId: orderId || `ORD-${Date.now()}`,
      customer: req.user?._id || undefined,
      customerId: req.user?._id?.toString() || '',
      customerName: customerName || finalShippingAddress.fullName || 'Customer',
      phone: phone || mobile || finalShippingAddress.phone || '',
      email: email || finalShippingAddress.email || '',
      shippingAddress: finalShippingAddress,
      items: mappedItems,
      subtotal: calcSubtotal,
      deliveryFee: fee,
      discount: discount || 0,
      total: finalTotal,
      deliveryAddress: [address, thana, district].filter(Boolean).join(', ') || finalShippingAddress.address,
      paymentMethod: paymentMethod || 'cash-on-delivery',
      notes: notes || '',
      status: 'Processing',
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message || 'Order creation failed' });
  }
};

const getOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([]);
    }

    const filter = req.user.role === 'admin'
      ? {}
      : {
          $or: [
            { customer: req.user._id },
            { customerId: req.user._id.toString() },
            ...(req.user.email ? [{ email: req.user.email }] : []),
            ...(req.user.phone ? [{ phone: req.user.phone }] : []),
          ],
        };

    const orders = await Order.find(filter)
      .populate('customer', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await findOrderByParam(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const populated = await order.populate('customer', 'fullName email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch order' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await findOrderByParam(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      if (!ownsOrder(req, order)) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({ message: 'Customers can only cancel their own orders' });
      }
      const current = (order.status || '').toLowerCase();
      if (current !== 'processing' && current !== 'pending' && current !== 'confirmed') {
        return res.status(400).json({ message: 'This order can no longer be cancelled' });
      }
    }

    order.status = status;
    if (status === 'Cancelled' && cancelReason) {
      order.cancelReason = cancelReason;
    }
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update order' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await findOrderByParam(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && !ownsOrder(req, order)) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const { status, deliveryFee, deliveryCost, discount, notes, cancelReason, shippingAddress } = req.body;

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      order.status = status;
    }

    if (deliveryFee !== undefined || deliveryCost !== undefined) {
      const fee = Number(deliveryFee ?? deliveryCost ?? order.deliveryFee);
      order.deliveryFee = fee >= 0 ? fee : 0;
    }

    if (discount !== undefined) {
      order.discount = Number(discount) >= 0 ? Number(discount) : 0;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    if (cancelReason !== undefined) {
      order.cancelReason = cancelReason;
    }

    if (shippingAddress) {
      order.shippingAddress = {
        ...(order.shippingAddress?.toObject?.() || order.shippingAddress || {}),
        ...shippingAddress,
      };
    }

    const sub = order.subtotal || order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    order.subtotal = sub;
    order.total = sub + (order.deliveryFee || 0) - (order.discount || 0);

    await order.save();
    const populated = await order.populate('customer', 'fullName email phone');
    res.json(populated);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: error.message || 'Failed to update order' });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, updateOrder };
