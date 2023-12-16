const User = require('../models/user');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.createAccountPost = [
  body('username', 'username must contain at least 4 characters')
    .trim()
    .isLength({ min: 4, max: 32 })
    .escape(),

  body('password', 'Password must contain at least 8 characters')
    .isLength({ min: 8, max: 64 })
    .escape(),

  body('username').custom(async (value) => {
    const userExists = await User.isUsernameExists(value);
    if (userExists) {
      throw new Error('Username already in use');
    }
  }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400);
      res.json({
        msg: 'there are errors',
        success: false,
        error: errors.array().map(value => value.msg)
      });
    } else {
      // data is valid, hash password and save
      bcrypt.hash(req.body.password, 12, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        }

        try {
          const user = new User({
            username: req.body.username,
            password: hashedPassword
          });

          await user.save();
          res.json({
            msg: 'account created',
            success: true
          });
        } catch (err) {
          return next(err);
        }
      });
    }
  })
];
