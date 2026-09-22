const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, address, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }

    const normalizedRole = 'customer';

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      address: address || '',
      role: normalizedRole,
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};



const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body; // the client sends ONLY the Google ID token

    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

  
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google token payload' });
    }

    // Optional but recommended: reject unverified Google emails
    if (!payload.email_verified) {
      return res.status(401).json({ message: 'Google email not verified' });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;          // stable, unique Google user ID
    const fullName = payload.name || email.split('@')[0];
    const avatar = payload.picture || '';

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        googleId,
        avatar,
        role: 'customer',
      });
    } else {
      let changed = false;

      // Backfill googleId if this account was created another way
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        changed = true;
      }
      if (changed) await user.save();
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      avatar: user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Google authentication failed' });
  }
};




const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch user' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Current password and a new password of at least 6 characters are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.password || !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to change password' });
  }
};

const getStaffUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'moderator'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff accounts' });
  }
};

const createStaffUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only an admin can create staff accounts' });

    const { fullName, email, password, role } = req.body;
    if (!fullName?.trim() || !email?.trim() || !password || !['admin', 'moderator'].includes(role)) {
      return res.status(400).json({ message: 'Full name, email, password, and a valid staff role are required' });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ fullName: fullName.trim(), email: normalizedEmail, password, role });
    const response = user.toObject();
    delete response.password;
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create staff account' });
  }
};

module.exports = { registerUser, loginUser, googleLogin, getMe, changePassword, getStaffUsers, createStaffUser };

