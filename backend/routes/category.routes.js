const express = require('express');
const upload = require('../middleware/upload');
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', adminOnly, upload.single('image'), createCategory);
router.put('/:id', adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', adminOnly, deleteCategory);

module.exports = router;
