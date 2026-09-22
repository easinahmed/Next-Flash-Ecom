const express = require('express');
const { getHeroBanner, updateHeroBanner } = require('../controllers/hero.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getHeroBanner);
router.put('/', protect, updateHeroBanner);

module.exports = router;
