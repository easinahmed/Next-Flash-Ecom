const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

async function findProduct(id) {
  if (!isObjectId(id)) return null;
  return Product.findById(id).select('name');
}

const getProductReviews = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const reviews = await Review.find({ product: product._id, status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product reviews' });
  }
};

const createReview = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { reviewerName, rating, comment, images } = req.body;
    const numericRating = Number(rating);
    if (!reviewerName?.trim() || !comment?.trim()) {
      return res.status(400).json({ message: 'Name, rating, and review are required' });
    }
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({
      product: product._id,
      productName: product.name,
      user: req.user?._id,
      reviewerName: reviewerName.trim(),
      rating: numericRating,
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      status: 'pending',
    });

    res.status(201).json({ message: 'Review submitted for approval', review });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit review' });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('product', 'name images')
      .populate('user', 'fullName email');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid review status' });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('product', 'name images')
      .populate('user', 'fullName email');
    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update review' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

module.exports = { getProductReviews, createReview, getAllReviews, updateReviewStatus, deleteReview };
