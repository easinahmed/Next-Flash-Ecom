const mongoose = require('mongoose');

const homepageSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);
