const Settings = require('../models/settings');
const asyncHandler = require('express-async-handler');

const checkSignupsStatus = asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne();

  if (!settings || !settings.allowSignups) {
    return res.status(403).json({
      status: 'fail',
      message: 'signups are closed'
    });
  }

  next();
});

module.exports = checkSignupsStatus;
