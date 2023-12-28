const Article = require('../models/article');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwtDecode = require('jwt-decode').jwtDecode;
const mongoose = require('mongoose');

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

exports.readArticleGet = asyncHandler(async (req, res, next) => {
  const articleId = req.params.articleid;

  if (!mongoose.isValidObjectId(articleId)) {
    res.sendStatus(404);
    return;
  }

  const article = await Article.findById(articleId).populate('author', 'username').exec();

  if (article) {
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

exports.updateArticlePut = [
  body('title', 'title must contain at least 2 characters')
    .trim()
    .isLength({ min: 2, max: 120 })
    .escape(),

  body('content', 'content must contain at least 2 characters')
    .trim()
    .isLength({ min: 2, max: 10000 })
    .escape(),

  body('hidden', 'must be a boolean')
    .trim()
    .isBoolean()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const articleId = req.params.articleid;
    const token = req.headers.authorization.split(' ')[1];
    const { sub } = jwtDecode(token);

    if (!errors.isEmpty()) {
      res.status(400);
      res.json({
        success: false,
        error: errors.array().map(value => value.msg)
      });
      return;
    }

    if (!mongoose.isValidObjectId(articleId)) {
      res.sendStatus(404);
      return;
    }

    const article = await Article.findById(articleId).populate('author', 'username').exec();
    if (!article) {
      res.sendStatus(404);
      return;
    }

    if (!sub || !article.author._id.equals(sub)) {
      res.status(403);
      res.json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    article.title = req.body.title;
    article.content = req.body.content;
    article.hidden = req.body.hidden;

    const editedArticle = await article.save();
    res.json({
      success: true,
      msg: 'article edited',
      articleId: editedArticle._id
    });
  })
];

exports.deleteArticle = asyncHandler(async (req, res, next) => {
  const articleId = req.params.articleid;
  const token = req.headers.authorization.split(' ')[1];
  const { sub } = jwtDecode(token);

  if (!mongoose.isValidObjectId(articleId)) {
    res.sendStatus(404);
    return;
  }

  const article = await Article.findById(articleId).populate('author', 'username').exec();

  if (!article) {
    res.sendStatus(404);
    return;
  }

  if (!sub || !article.author._id.equals(sub)) {
    res.status(403);
    res.json({
      success: false,
      error: 'Unauthorized'
    });
    return;
  }

  const result = await article.deleteOne();

  res.json({
    success: true,
    msg: 'article deleted',
    deletedCount: result.deletedCount
  });
});
