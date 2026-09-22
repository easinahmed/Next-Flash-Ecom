const express = require('express');
const {
  getProductReviews,
  createReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/review.controller');
const { protectOptional } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protectOptional, createReview);
router.get('/', adminOnly, getAllReviews);
router.patch('/:id/status', adminOnly, updateReviewStatus);
router.delete('/:id', adminOnly, deleteReview);

module.exports = router;
