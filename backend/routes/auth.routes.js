const express = require('express');
const { registerUser, loginUser, googleLogin, getMe, changePassword, getStaffUsers, createStaffUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/password', protect, changePassword);
router.get('/staff', adminOnly, getStaffUsers);
router.post('/staff', adminOnly, createStaffUser);

module.exports = router;
