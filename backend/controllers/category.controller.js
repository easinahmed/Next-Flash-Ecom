const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary.config');
const NAVBAR_SECTIONS = new Set(['', 'accessories', 'leatherstudio', 'sneakerstudio']);

const normalizeSubcategories = (value) => {
  if (value === undefined) return undefined;
  const subcategories = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(subcategories) || !subcategories.every((item) => typeof item === 'string')) {
    throw new Error('Subcategories must be an array of names');
  }
  const uniqueSubcategories = new Map();
  subcategories.forEach((item) => {
    const name = item.trim();
    if (name && !uniqueSubcategories.has(name.toLowerCase())) {
      uniqueSubcategories.set(name.toLowerCase(), name);
    }
  });
  return [...uniqueSubcategories.values()];
};

const normalizeNavbarSection = (value) => {
  if (value === undefined) return undefined;
  const section = value === 'none' || value === null ? '' : String(value).trim().toLowerCase();
  if (!NAVBAR_SECTIONS.has(section)) {
    throw new Error('Invalid navbar section');
  }
  return section;
};

const ensureNavbarSectionAvailable = async (section, categoryId) => {
  if (!section) return;
  const query = { navbarSection: section };
  if (categoryId) query._id = { $ne: categoryId };
  if (await Category.exists(query)) {
    throw new Error('This navbar section is already assigned to another category');
  }
};

const uploadCategoryImage = async (file) => {
  if (!file) return null;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'flash-store/categories',
        resource_type: 'image',
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(uploadResult);
      }
    );

    stream.end(file.buffer);
  });

  return result.secure_url;
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.navbarSection !== undefined) {
      payload.navbarSection = normalizeNavbarSection(payload.navbarSection);
      await ensureNavbarSectionAvailable(payload.navbarSection);
    }
    if (payload.subcategories !== undefined) {
      payload.subcategories = normalizeSubcategories(payload.subcategories);
    }
    if (req.file) {
      const uploadedImage = await uploadCategoryImage(req.file);
      payload.image = uploadedImage;
    }
    const category = await Category.create(payload);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Category creation failed' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.navbarSection !== undefined) {
      payload.navbarSection = normalizeNavbarSection(payload.navbarSection);
    }
    if (payload.subcategories !== undefined) {
      payload.subcategories = normalizeSubcategories(payload.subcategories);
    }
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) return res.status(404).json({ message: 'Category not found' });
    if (payload.navbarSection !== undefined) {
      await ensureNavbarSectionAvailable(payload.navbarSection, existingCategory._id);
    }
    if (payload.subcategories) {
      const removedSubcategories = existingCategory.subcategories.filter(
        (name) => !payload.subcategories.some((nextName) => nextName.toLowerCase() === name.toLowerCase())
      );
      if (removedSubcategories.length > 0) {
        const assignedProduct = await Product.exists({
          category: { $in: [existingCategory.name, existingCategory.slug] },
          subcategory: { $in: removedSubcategories },
        });
        if (assignedProduct) {
          return res.status(400).json({ message: 'Cannot remove a subcategory assigned to a product' });
        }
      }
    }
    if (req.file) {
      const uploadedImage = await uploadCategoryImage(req.file);
      payload.image = uploadedImage;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Category update failed' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
