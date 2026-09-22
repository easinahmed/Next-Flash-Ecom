const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus, updateOrder } = require('../controllers/order.controller');
const { protectOptional } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/', protectOptional, getOrders);
router.post('/', protectOptional, createOrder);
router.get('/:id', protectOptional, getOrderById);
router.patch('/:id/status', protectOptional, updateOrderStatus);
router.put('/:id/status', protectOptional, updateOrderStatus);
router.put('/:id', protectOptional, updateOrder);

module.exports = router;
