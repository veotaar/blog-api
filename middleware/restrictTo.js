const restrictTo = (...roles) => (req, res, next) => {
  const userRoles = req.user.roles;

  if (!userRoles.some((role) => roles.includes(role))) {
    return res.status(403).json({
      status: 'fail',
      data: {
        message: 'Unauthorized'
      }
    });
  }

  next();
};

module.exports = restrictTo;
