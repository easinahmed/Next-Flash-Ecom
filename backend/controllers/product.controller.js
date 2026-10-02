const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary.config');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateSubcategory = async (categoryName, subcategory) => {
  if (!subcategory) return;
  if (typeof subcategory !== 'string') {
    throw new Error('Subcategory must be a name');
  }
  if (typeof categoryName !== 'string' || !categoryName.trim()) {
    throw new Error('Select a category before assigning a subcategory');
  }
  const category = await Category.findOne({
    $or: [
      { name: { $regex: `^${escapeRegex(categoryName)}$`, $options: 'i' } },
      { slug: categoryName },
    ],
  });
  if (!category?.subcategories?.some((name) => name.toLowerCase() === subcategory.trim().toLowerCase())) {
    throw new Error('Subcategory must belong to the selected category');
  }
};

const uploadProductImage = async (file) => {
  if (!file) return null;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'flash-store/products',
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

const createProduct = async (req, res) => {
  try {
    const payload = { ...req.body };
    await validateSubcategory(payload.category, payload.subcategory);

    if (payload.category === 'featured') {
      payload.featured = true;
    }

    if (payload.featured === 'false') {
      payload.featured = false;
    }

    if (payload.featured === 'true') {
      payload.featured = true;
    }

    if (req.file) {
      const uploadedImage = await uploadProductImage(req.file);
      payload.images = [uploadedImage];
    }

    // normalize placement flags
    if (payload.bestSeller === 'true' || payload.bestSeller === true) payload.bestSeller = true;
    if (payload.bestSeller === 'false') payload.bestSeller = false;
    if (payload.justLanded === 'true' || payload.justLanded === true) payload.justLanded = true;
    if (payload.justLanded === 'false') payload.justLanded = false;
    if (payload.accessories === 'true' || payload.accessories === true) payload.accessories = true;
    if (payload.accessories === 'false') payload.accessories = false;
    if (payload.comboDeal === 'true' || payload.comboDeal === true) payload.comboDeal = true;
    if (payload.comboDeal === 'false' || payload.comboDeal === false) payload.comboDeal = false;

    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Product creation failed' });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, subcategory, brand, gender, featured, discounted, minDiscount, search } = req.query;
    if (subcategory && typeof subcategory !== 'string') {
      return res.status(400).json({ message: 'Subcategory must be a single name' });
    }
    const discountThreshold = minDiscount === undefined ? null : Number(minDiscount);
    if (discountThreshold !== null && (!Number.isFinite(discountThreshold) || discountThreshold < 0 || discountThreshold > 100)) {
      return res.status(400).json({ message: 'Minimum discount must be between 0 and 100' });
    }

    const query = { isActive: true };

    if (category) {
      const matchingCat = await Category.findOne({
        $or: [
          { slug: category },
          { name: { $regex: new RegExp(`^${category.replace(/-/g, '[ -]')}$`, 'i') } }
        ]
      });

      const rawNoTime = category.replace(/-\d+$/, '');
      const patterns = [
        category,
        category.replace(/-/g, ' '),
        category.replace(/-/g, '[ -]'),
        rawNoTime,
        rawNoTime.replace(/-/g, ' '),
        matchingCat ? matchingCat.name : null,
        matchingCat ? matchingCat.slug : null,
      ].filter(Boolean);

      const uniquePatterns = Array.from(new Set(patterns));
      const regexStr = `^(${uniquePatterns.map(p => p.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/\\[ -]/g, '[ -]')).join('|')})$`;
      query.category = { $regex: new RegExp(regexStr, 'i') };
    }
    if (subcategory) {
      const escapedSubcategory = subcategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.subcategory = { $regex: `^${escapedSubcategory}$`, $options: 'i' };
    }
    if (featured === 'true') query.featured = true;
    if (brand) query.brand = { $regex: `^${brand}$`, $options: 'i' };
    if (gender) query.gender = gender.toLowerCase();
    const discountConditions = [];
    if (discounted === 'true' || discountThreshold > 0) {
      discountConditions.push({ $gt: ['$originalPrice', '$price'] });
    }
    if (discountThreshold !== null) {
      discountConditions.push({
        $gte: [
          { $multiply: [{ $subtract: ['$originalPrice', '$price'] }, 100] },
          { $multiply: ['$originalPrice', discountThreshold] },
        ],
      });
    }
    if (discountConditions.length === 1) query.$expr = discountConditions[0];
    if (discountConditions.length > 1) query.$expr = { $and: discountConditions };

    // support filtering by placement flags
    if (req.query.bestSeller === 'true') query.bestSeller = true;
    if (req.query.justLanded === 'true') query.justLanded = true;
    if (req.query.accessories === 'true') query.accessories = true;
    if (req.query.comboDeal === 'true') query.comboDeal = true;
    if (search) {
      const searchTerms = search.trim().split(/\s+/).filter(Boolean);
      const searchableFields = [
        'name',
        'brand',
        'category',
        'subcategory',
        'description',
        'descriptionEnglish',
        'descriptionBengali',
        'fullDescriptionEnglish',
        'fullDescriptionBengali',
      ];
      query.$and = searchTerms.map((term) => {
        const escapedTerm = escapeRegex(term);
        return {
          $or: searchableFields.map((field) => ({
            [field]: { $regex: escapedTerm, $options: 'i' },
          })),
        };
      });
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const payload = { ...req.body };
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (payload.category && payload.category !== existingProduct.category && payload.subcategory === undefined) {
      payload.subcategory = '';
    }
    await validateSubcategory(
      payload.category || existingProduct.category,
      payload.subcategory === undefined ? existingProduct.subcategory : payload.subcategory
    );

    if (payload.category === 'featured') {
      payload.featured = true;
    }

    if (payload.featured === 'false') {
      payload.featured = false;
    }

    if (payload.featured === 'true') {
      payload.featured = true;
    }

    if (req.file) {
      const uploadedImage = await uploadProductImage(req.file);
      payload.images = [uploadedImage];
    }

    // normalize placement flags
    if (payload.bestSeller === 'true' || payload.bestSeller === true) payload.bestSeller = true;
    if (payload.bestSeller === 'false') payload.bestSeller = false;
    if (payload.justLanded === 'true' || payload.justLanded === true) payload.justLanded = true;
    if (payload.justLanded === 'false') payload.justLanded = false;
    if (payload.accessories === 'true' || payload.accessories === true) payload.accessories = true;
    if (payload.accessories === 'false') payload.accessories = false;
    if (payload.comboDeal === 'true' || payload.comboDeal === true) payload.comboDeal = true;
    if (payload.comboDeal === 'false' || payload.comboDeal === false) payload.comboDeal = false;

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Product update failed' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
