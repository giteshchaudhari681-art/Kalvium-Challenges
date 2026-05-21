function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        error: 'Forbidden: insufficient permissions',
        required: roles,
        yourRole: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: insufficient permissions',
        required: roles,
        yourRole: req.user.role,
      });
    }

    next();
  };
}

module.exports = { requireRole };
