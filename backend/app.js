const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db.config');
const User = require('./models/User');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const uploadRoutes = require('./routes/upload.routes');
const customerRoutes = require('./routes/customer.routes');
const orderRoutes = require('./routes/order.routes');
const heroRoutes = require('./routes/hero.routes');
const categoryRoutes = require('./routes/category.routes');
const brandRoutes = require('./routes/brand.routes');
const courierRoutes = require('./routes/courier.routes');
const reviewRoutes = require('./routes/review.routes');
const sitePageRoutes = require('./routes/sitePage.routes');
const seedDB = require('./utils/seedDB');

dotenv.config();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@flash.com' });
    if (!existingAdmin) {
      await User.create({
        fullName: 'Flash Admin',
        email: 'admin@flash.com',
        password: 'admin123',
        role: 'admin',
        phone: '0000000000',
        address: 'Head Office',
      });
      console.log('Default admin created: admin@flash.com / admin123');
    }
  } catch (error) {
    console.error('Admin seed failed:', error.message);
  }
};

ensureDefaultAdmin();
seedDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flash backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/courier', courierRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/site-pages', sitePageRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;