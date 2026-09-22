const mongoose = require('mongoose');

const sitePageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    sections: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SitePage', sitePageSchema);
