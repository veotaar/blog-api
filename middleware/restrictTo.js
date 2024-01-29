const restrictTo = (...roles) => (req, res, next) => {
  const userRoles = req.user.roles;

  if (!userRoles.some((role) => roles.includes(role))) {
    res.status(403);
    return res.json({
      success: false,
      error: 'Unauthorized'
    });
  }

  next();
};

module.exports = restrictTo;
