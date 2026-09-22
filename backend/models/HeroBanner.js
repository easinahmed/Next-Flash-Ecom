const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '/shopnow',
    },
  },
  { _id: false }
);

const heroBannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'homepage-hero',
      unique: true,
    },
    slides: {
      type: [slideSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroBanner', heroBannerSchema);
