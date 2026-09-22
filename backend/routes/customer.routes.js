const express = require('express');
const { getAllCustomers, getCustomerById, createCustomer, updateCustomer, updateCustomerStatus } = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');


const router = express.Router();

router.get('/', adminOnly, getAllCustomers);
router.get('/:id', adminOnly, getCustomerById);
router.post('/', adminOnly, createCustomer);
router.put('/:id', adminOnly, updateCustomer);
router.patch('/:id/status', adminOnly, updateCustomerStatus);

module.exports = router;
