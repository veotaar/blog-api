const Article = require('../models/article');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwtDecode = require('jwt-decode').jwtDecode;

exports.createArticlePost = [
  body('title', 'title must contain at least 2 characters')
    .trim()
    .isLength({ min: 2, max: 120 })
    .escape(),

  body('content', 'content must contain at least 2 characters')
    .trim()
    .isLength({ min: 2, max: 10000 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const token = req.headers.authorization.split(' ')[1];
    const { sub } = jwtDecode(token);

    if (!errors.isEmpty()) {
      res.status(400);
      res.json({
        success: false,
        error: errors.array().map(value => value.msg)
      });
    } else if (!sub) {
      res.status(403);
      res.json({
        success: false,
        error: 'Unauthorized'
      });
    } else {
      try {
        // get the userId for the author field from the jsonwebtoken
        // this will be a protected route, jwt is already verified
        const article = new Article({
          author: sub,
          title: req.body.title,
          content: req.body.content
        });

        const createdArticle = await article.save();
        res.json({
          success: true,
          msg: 'article created',
          articleId: createdArticle._id
        });
      } catch (err) {
        return next(err);
      }
    }
  })
];
