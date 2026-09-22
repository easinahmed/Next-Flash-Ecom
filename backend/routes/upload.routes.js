const express = require('express');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary.config');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/product-image', adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

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

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Image upload failed' });
  }
});

router.post('/hero-image', adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No hero image file provided' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'flash-store/heroes',
          resource_type: 'image',
        },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
      );

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      message: 'Hero image uploaded successfully',
      imageUrl: result.secure_url,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Hero image upload failed' });
  }
});

module.exports = router;
