const Settings = require('../models/settings');
const asyncHandler = require('express-async-handler');

const checkCommentsStatus = asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne();

  if (!settings || !settings.allowComments) {
    return res.status(403).json({
      status: 'fail',
      message: 'commenting is disabled'
    });
  }

  next();
});

module.exports = checkCommentsStatus;
