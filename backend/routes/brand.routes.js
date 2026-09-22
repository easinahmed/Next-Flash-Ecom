const express = require('express');
const upload = require('../middleware/upload');
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brand.controller');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/', getBrands);
router.post('/', adminOnly, upload.single('image'), createBrand);
router.put('/:id', adminOnly, upload.single('image'), updateBrand);
router.delete('/:id', adminOnly, deleteBrand);

module.exports = router;
