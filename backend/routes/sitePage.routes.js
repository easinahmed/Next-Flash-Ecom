const express = require('express');
const { getSitePages, getSitePage, updateSitePage } = require('../controllers/sitePage.controller');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/', adminOnly, getSitePages);
router.get('/:slug', getSitePage);
router.put('/:slug', adminOnly, updateSitePage);

module.exports = router;
