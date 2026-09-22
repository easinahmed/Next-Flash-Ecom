const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'flash-secret-key';

  return jwt.sign({ userId }, secret, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
