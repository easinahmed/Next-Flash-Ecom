const express = require('express');
const {
  getCourierSettings,
  updateCourierSetting,
  testCourierConnection,
  createCourierConsignment,
} = require('../controllers/courier.controller');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/settings', adminOnly, getCourierSettings);
router.put('/settings/:provider', adminOnly, updateCourierSetting);
router.post('/test/:provider', adminOnly, testCourierConnection);
router.post('/dispatch/:orderId', adminOnly, createCourierConsignment);

module.exports = router;
