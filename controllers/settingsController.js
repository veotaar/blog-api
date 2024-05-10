const Settings = require('../models/settings');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.createSettingPost = asyncHandler(async (req, res) => {
  const settings = new Settings();

  const createdSettings = await settings.save();
  const { allowComments, allowSignups, loginRoles } = createdSettings;

  return res.status(201).json({
    status: 'success',
    data: {
      settings: {
        allowComments,
        allowSignups,
        loginRoles
      }
    }
  });
});

exports.readSettingsGet = asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne();

  if (!settings) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'settings not found'
      }
    });
  }

  return res.json({
    status: 'success',
    data: {
      settings
    }
  });
});

exports.readSignupStatus = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne();

  if (!settings) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'settings not found'
      }
    });
  }

  const { allowSignups } = settings;

  return res.json({
    status: 'success',
    data: {
      allowSignups
    }
  });
});

exports.readCommentStatus = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne();

  if (!settings) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'settings not found'
      }
    });
  }

  const { allowComments } = settings;

  return res.json({
    status: 'success',
    data: {
      allowComments
    }
  });
});

exports.updateSettingsPut = [
  body('allowSignups', 'must be a boolean')
    .trim()
    .isBoolean()
    .escape(),

  body('allowComments', 'must be a boolean')
    .trim()
    .isBoolean()
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const errorObject = Object.fromEntries(errors.array().map(e => [e.path, e.msg]));

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        data: errorObject
      });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'settings not found'
        }
      });
    }

    settings.allowSignups = req.body.allowSignups;
    settings.allowComments = req.body.allowComments;

    const editedSettings = await settings.save();

    return res.json({
      status: 'success',
      data: {
        settings: editedSettings
      }
    });
  })
];
