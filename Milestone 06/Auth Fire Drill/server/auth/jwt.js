
const jwt = require('jsonwebtoken');

const TOKEN_EXPIRY = '1h';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET must be set before the server starts');
  }

  return secret;
};

const signToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = { signToken, verifyToken, TOKEN_EXPIRY, getJwtSecret };
