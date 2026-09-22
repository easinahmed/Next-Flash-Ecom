const Brand = require('../models/Brand');
const cloudinary = require('../config/cloudinary.config');

const uploadBrandImage = async (file) => {
  if (!file) return null;
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'flash-store/brands', resource_type: 'image' },
      (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
    );
    stream.end(file.buffer);
  });
  return result.secure_url;
};

const makeSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Brand name is required' });
    const slug = makeSlug(name);
    const image = req.file ? await uploadBrandImage(req.file) : '';
    const brand = await Brand.create({ name: name.trim(), slug, image });
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.code === 11000 ? 'Brand name already exists' : error.message || 'Brand creation failed' });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    if (req.body.name?.trim()) {
      brand.name = req.body.name.trim();
      brand.slug = makeSlug(brand.name);
    }
    if (req.file) brand.image = await uploadBrandImage(req.file);
    await brand.save();
    res.json(brand);
  } catch (error) {
    res.status(400).json({ message: error.code === 11000 ? 'Brand name already exists' : error.message || 'Brand update failed' });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete brand' });
  }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
