const Product = require('../models/Product');
const Order = require('../models/Order');

const DEFAULT_PRODUCTS = [
  {
    name: 'Air Jordan Retro High Sneakers',
    title: 'Air Jordan Retro High Sneakers',
    price: 3450,
    oldPrice: 4200,
    discountPercentage: 18,
    category: 'sneakers',
    brand: 'Nike',
    description: 'Iconic high-top sneakers with premium cushioning and bold color contrast.',
    images: ['/shoe1.avif', '/shoe2.avif'],
    image: '/shoe1.avif',
    stock: 25,
    rating: 4.8,
    bestSeller: true,
    justLanded: true,
    featured: true,
    isActive: true,
  },
  {
    name: 'Urban Runner Leather Shoes',
    title: 'Urban Runner Leather Shoes',
    price: 2890,
    oldPrice: 3500,
    discountPercentage: 17,
    category: 'leather-shoes',
    brand: 'Leather Studio',
    description: 'Handcrafted genuine leather footwear tailored for elegance and everyday comfort.',
    images: ['/shoe2.avif', '/shoe3.avif'],
    image: '/shoe2.avif',
    stock: 18,
    rating: 4.7,
    bestSeller: true,
    justLanded: false,
    featured: true,
    isActive: true,
  },
  {
    name: 'Genuine Leather Loafers',
    title: 'Genuine Leather Loafers',
    price: 3200,
    oldPrice: 3800,
    discountPercentage: 15,
    category: 'leather-shoes',
    brand: 'Leather Studio',
    description: 'Sleek tan brown leather loafers featuring cushioned insoles and durable stitching.',
    images: ['/shoe3.avif', '/shoe4.webp'],
    image: '/shoe3.avif',
    stock: 12,
    rating: 4.9,
    bestSeller: true,
    justLanded: true,
    featured: true,
    isActive: true,
  },
  {
    name: 'Casual Canvas Slip-Ons',
    title: 'Casual Canvas Slip-Ons',
    price: 1290,
    oldPrice: 1600,
    discountPercentage: 19,
    category: 'mens-shoes',
    brand: 'Adidas',
    description: 'Lightweight canvas shoes built for maximum breathable comfort during summer wear.',
    images: ['/shoe4.webp', '/shoe5.avif'],
    image: '/shoe4.webp',
    stock: 30,
    rating: 4.5,
    bestSeller: false,
    justLanded: true,
    featured: false,
    isActive: true,
  },
  {
    name: 'Pro Basketball High-Tops',
    title: 'Pro Basketball High-Tops',
    price: 3890,
    oldPrice: 4500,
    discountPercentage: 13,
    category: 'sneakers',
    brand: 'Puma',
    description: 'Engineered sports sneakers providing maximum ankle stability and jump response.',
    images: ['/shoe5.avif', '/shoe1.avif'],
    image: '/shoe5.avif',
    stock: 15,
    rating: 4.8,
    bestSeller: true,
    justLanded: true,
    featured: true,
    isActive: true,
  },
  {
    name: 'Leather Handbag & Shoulder Bag',
    title: 'Leather Handbag & Shoulder Bag',
    price: 2450,
    oldPrice: 3100,
    discountPercentage: 21,
    category: 'bags',
    brand: 'Flash Leather',
    description: 'Spacious women leather handbag with interior organizer pockets.',
    images: ['/shoe6.avif', '/shoe7.avif'],
    image: '/shoe6.avif',
    stock: 20,
    rating: 4.6,
    bestSeller: false,
    justLanded: true,
    featured: true,
    isActive: true,
  }
];

const seedDB = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
      console.log('Default products seeded successfully!');
    }

  } catch (err) {
    console.error('Error seeding DB:', err.message);
  }
};

module.exports = seedDB;
