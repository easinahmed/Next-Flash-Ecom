const mongoose = require('mongoose');
const HomepageSection = require('../models/HomepageSection');
const Product = require('../models/Product');

const getHomepageSections = async (_req, res) => {
  try {
    const sections = await HomepageSection.find({ isActive: true })
      .populate({ path: 'products', match: { isActive: true } })
      .sort({ title: 1 });
    res.json(sections);
  } catch (error) {
    console.error('Failed to fetch homepage sections:', error);
    res.status(500).json({ message: 'Failed to fetch homepage sections' });
  }
};

const updateHomepageSection = async (req, res) => {
  try {
    const { key } = req.params;
    const { title, productIds } = req.body;
    if (!/^[a-z0-9-]+$/i.test(key)) {
      return res.status(400).json({ message: 'Invalid homepage section key' });
    }
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Section title is required' });
    }
    if (!Array.isArray(productIds) || productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: 'Product IDs must be a list of valid product IDs' });
    }

    const uniqueProductIds = [...new Set(productIds.map(String))];
    const productCount = await Product.countDocuments({ _id: { $in: uniqueProductIds } });
    if (productCount !== uniqueProductIds.length) {
      return res.status(400).json({ message: 'One or more selected products could not be found' });
    }

    const section = await HomepageSection.findOneAndUpdate(
      { key },
      { key, title: title.trim(), products: uniqueProductIds, isActive: true },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate({ path: 'products', match: { isActive: true } });

    res.json(section);
  } catch (error) {
    console.error('Failed to update homepage section:', error);
    res.status(500).json({ message: 'Failed to update homepage section' });
  }
};

module.exports = { getHomepageSections, updateHomepageSection };
