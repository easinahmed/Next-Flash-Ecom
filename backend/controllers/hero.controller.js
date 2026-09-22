const HeroBanner = require('../models/HeroBanner');

const getHeroBanner = async (req, res) => {
  try {
    const hero = await HeroBanner.findOne({ name: 'homepage-hero' });

    res.json({
      slides: hero?.slides || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch hero banner' });
  }
};

const updateHeroBanner = async (req, res) => {
  try {
    const { slides } = req.body || {};

    if (!Array.isArray(slides)) {
      return res.status(400).json({ message: 'Slides must be an array' });
    }

    const sanitizedSlides = slides
      .filter((slide) => slide && slide.image)
      .map((slide) => ({
        image: slide.image,
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        link: slide.link || '/shopnow',
      }));

    const hero = await HeroBanner.findOneAndUpdate(
      { name: 'homepage-hero' },
      { name: 'homepage-hero', slides: sanitizedSlides },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ slides: hero.slides || [] });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to update hero banner' });
  }
};

module.exports = {
  getHeroBanner,
  updateHeroBanner,
};
