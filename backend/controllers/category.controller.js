const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary.config');

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
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const payload = { ...req.body };
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
