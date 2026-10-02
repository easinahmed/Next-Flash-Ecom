const express = require('express');
const { getHomepageSections, updateHomepageSection } = require('../controllers/homepageSection.controller');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/', getHomepageSections);
router.put('/:key', adminOnly, updateHomepageSection);

module.exports = router;
