const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary.config');

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

    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Product creation failed' });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, brand, gender, featured, discounted, search } = req.query;

    const query = { isActive: true };

    if (category) {
      const Category = require('../models/Category');
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
    if (featured === 'true') query.featured = true;
    if (brand) query.brand = { $regex: `^${brand}$`, $options: 'i' };
    if (gender) query.gender = gender.toLowerCase();
    if (discounted === 'true') query.$expr = { $gt: ['$originalPrice', '$price'] };

    // support filtering by placement flags
    if (req.query.bestSeller === 'true') query.bestSeller = true;
    if (req.query.justLanded === 'true') query.justLanded = true;
    if (req.query.accessories === 'true') query.accessories = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
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
