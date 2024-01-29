const Article = require('../models/article');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
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

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400);
      return res.json({
        success: false,
        error: errors.array().map(value => value.msg)
      });
    }

    const article = new Article({
      author: req.user._id.toString(),
      title: req.body.title,
      content: req.body.content
    });

    const createdArticle = await article.save();

    return res.json({
      success: true,
      msg: 'article created',
      articleId: createdArticle._id
    });
  })
];

exports.readArticleGet = asyncHandler(async (req, res, next) => {
  const articleId = req.params.articleid;

  if (!mongoose.isValidObjectId(articleId)) return res.sendStatus(404);

  const article = await Article.findById(articleId).populate('author', 'username').populate('comments');

  if (!article || !article.published) return res.sendStatus(404);

  return res.json(article);
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

  body('published', 'must be a boolean')
    .trim()
    .isBoolean()
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const articleId = req.params.articleid;

    if (!errors.isEmpty()) {
      res.status(400);
      return res.json({
        success: false,
        error: errors.array().map(value => value.msg)
      });
    }

    if (!mongoose.isValidObjectId(articleId)) return res.sendStatus(404);

    const article = await Article.findById(articleId).populate('author', 'username').exec();
    if (!article) return res.sendStatus(404);

    article.title = req.body.title;
    article.content = req.body.content;
    article.published = req.body.published;

    const editedArticle = await article.save();

    return res.json({
      success: true,
      msg: 'article edited',
      articleId: editedArticle._id
    });
  })
];

exports.deleteArticle = asyncHandler(async (req, res) => {
  const articleId = req.params.articleid;

  if (!mongoose.isValidObjectId(articleId)) return res.sendStatus(404);

  const article = await Article.findById(articleId).populate('author', 'username').exec();

  if (!article) return res.sendStatus(404);

  // delete comments
  if (article.comments.length > 0) {
    await Comment.deleteMany({ _id: { $in: article.comments } });
  }

  const result = await article.deleteOne();

  return res.json({
    success: true,
    msg: 'article deleted',
    deletedCount: result.deletedCount
  });
});

exports.listArticlesGet = asyncHandler(async (req, res) => {
  const itemsPerPage = 9;
  const page = req.query.page || 1;
  const skip = (page - 1) * itemsPerPage;
  const query = { published: true };

  const countPromise = Article.countDocuments(query);
  const articlesPromise = Article.find(query).sort('-createdAt').limit(itemsPerPage).skip(skip).populate('author', 'username').select('-content -comments');

  const [count, articles] = await Promise.all([countPromise, articlesPromise]);

  const pageCount = Math.ceil(count / itemsPerPage);

  return res.json({
    pagination: {
      count,
      pageCount
    },
    articles
  });
});

// TODO find a better solution later
exports.listAllArticles = asyncHandler(async (req, res) => {
  const itemsPerPage = 9;
  const page = req.query.page || 1;
  const skip = (page - 1) * itemsPerPage;
  const query = {};

  const countPromise = Article.countDocuments(query);
  const articlesPromise = Article.find(query).sort('-createdAt').limit(itemsPerPage).skip(skip).populate('author', 'username').select('-content -comments');

  const [count, articles] = await Promise.all([countPromise, articlesPromise]);

  const pageCount = Math.ceil(count / itemsPerPage);

  return res.json({
    pagination: {
      count,
      pageCount
    },
    articles
  });
});
