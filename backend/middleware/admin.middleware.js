const { protect } = require('./auth.middleware');

const adminOnly = async (req, res, next) => {
  await protect(req, res, () => {
    if (!['admin', 'moderator'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  });
};

module.exports = { adminOnly };
