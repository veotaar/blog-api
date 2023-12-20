const User = require('../models/user');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const issueJWT = require('../lib/utils').issueJWT;

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

          const createdUser = await user.save();
          const jwt = issueJWT(createdUser);
          res.json({
            msg: 'account created',
            success: true,
            user: createdUser,
            token: jwt.token,
            expiresIn: jwt.expires
          });
        } catch (err) {
          return next(err);
        }
      });
    }
  })
];

exports.loginPost = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      res.status(401);
      res.json({ success: false, msg: 'wrong username or password' });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      res.status(401);
      res.json({ success: false, msg: 'wrong username or password' });
    }

    const jwt = issueJWT(user);
    res.status(200);
    res.json({ success: true, user, token: jwt.token, expiresIn: jwt.expires });
  } catch (err) {
    return next(err);
  }
});
