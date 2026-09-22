const SitePage = require('../models/SitePage');

const getSitePages = async (req, res) => {
  try {
    const pages = await SitePage.find().sort({ slug: 1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch site pages' });
  }
};

const getSitePage = async (req, res) => {
  try {
    const page = await SitePage.findOne({ slug: req.params.slug, isPublished: true });
    res.json(page || null);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch site page' });
  }
};

const updateSitePage = async (req, res) => {
  try {
    const { title, content = '', sections = [], isPublished } = req.body;
    if (!req.params.slug || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'Page sections are required' });
    }
    const page = await SitePage.findOneAndUpdate(
      { slug: req.params.slug },
      { slug: req.params.slug, title: title || '', content, sections, isPublished: isPublished !== false },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(page);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to save site page' });
  }
};

module.exports = { getSitePages, getSitePage, updateSitePage };
