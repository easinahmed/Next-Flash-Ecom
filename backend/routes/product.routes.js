const express = require('express');
const upload = require('../middleware/upload');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', adminOnly, upload.single('image'), createProduct);
router.put('/:id', adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', adminOnly, deleteProduct);

module.exports = router;
