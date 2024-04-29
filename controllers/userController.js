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
    const errorObject = Object.fromEntries(
      errors.array().map((e) => [e.path, e.msg])
    );

    if (!errors.isEmpty()) {
      res.status(400);
      return res.json({
        status: 'fail',
        data: errorObject
      });
    }

    // data is valid, hash password and save
    bcrypt.hash(req.body.password, 12, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const user = new User({
        username: req.body.username,
        password: hashedPassword
      });

      const createdUser = await user.save();
      const jwt = issueJWT(createdUser);

      // res.cookie('access_token', jwt.token, { maxAge: 1000 * 60 * 60 * 8, httpOnly: true });

      return res.json({
        status: 'success',
        data: {
          user: {
            id: createdUser.id,
            username: createdUser.username,
            roles: createdUser.roles
          },
          jwt: {
            token: jwt.token,
            expires: jwt.expires
          }
        }
      });
    });
  })
];

exports.loginPost = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username });

  if (!user) {
    return res.status(401).json({
      status: 'fail',
      data: {
        message: 'wrong username or password'
      }
    });
  }

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) {
    return res.status(401).json({
      status: 'fail',
      data: {
        message: 'wrong username or password'
      }
    });
  }

  const jwt = issueJWT(user);

  // res.cookie('access_token', jwt.token, { maxAge: 1000 * 60 * 60 * 8, httpOnly: true });

  return res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles
      },
      jwt: {
        token: jwt.token,
        expires: jwt.expires
      }
    }
  });
});
