const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subcategories: {
      type: [String],
      default: [],
    },
    navbarSection: {
      type: String,
      enum: ['', 'accessories', 'leatherstudio', 'sneakerstudio'],
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

categorySchema.index(
  { navbarSection: 1 },
  { unique: true, partialFilterExpression: { navbarSection: { $gt: '' } } }
);

categorySchema.pre('validate', function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
