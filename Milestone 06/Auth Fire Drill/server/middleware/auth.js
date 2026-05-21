
const { verifyToken } = require('../auth/jwt');
const { isTokenBlacklisted } = require('../data/store');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }

  try {
    const decoded = verifyToken(token);
    req.token = token;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      csrfToken: decoded.csrfToken,
      exp: decoded.exp,
      iat: decoded.iat,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Auth failed' });
  }
};

module.exports = auth;
