
const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    next();
  };
};

module.exports = roleCheck;
