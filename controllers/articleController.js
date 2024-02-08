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
    .isLength({ min: 2, max: 100000 })
    .escape(),

  body('published', 'must be a boolean')
    .trim()
    .isBoolean()
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const errorObject = Object.fromEntries(errors.array().map(e => [e.path, e.msg]));

    if (!errors.isEmpty()) {
      res.status(400);
      return res.json({
        status: 'fail',
        data: errorObject
      });
    }

    const article = new Article({
      author: req.user._id.toString(),
      title: req.body.title,
      content: req.body.content,
      published: req.body.published
    });

    const createdArticle = await article.save();
    const { id } = createdArticle;

    return res.status(201).json({
      status: 'success',
      data: {
        post: {
          id,
          path: `/posts/${id}`
        }
      }
    });
  })
];

exports.readArticleGet = asyncHandler(async (req, res, next) => {
  const articleId = req.params.articleid;

  if (!mongoose.isValidObjectId(articleId)) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'article not found'
      }
    });
  }

  const article = await Article.findById(articleId).populate('author', 'username').populate('comments');

  if (!article || !article.published) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'article not found'
      }
    });
  }

  return res.json({
    status: 'success',
    data: {
      post: article
    }
  });
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
    const errorObject = Object.fromEntries(errors.array().map(e => [e.path, e.msg]));

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        data: errorObject
      });
    }

    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'article not found'
        }
      });
    }

    const article = await Article.findById(articleId).populate('author', 'username').exec();
    if (!article) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'article not found'
        }
      });
    }

    article.title = req.body.title;
    article.content = req.body.content;
    article.published = req.body.published;

    const editedArticle = await article.save();
    const { id } = editedArticle;

    return res.json({
      status: 'success',
      data: {
        post: {
          id,
          path: `/posts/${id}`
        }
      }
    });
  })
];

exports.deleteArticle = asyncHandler(async (req, res) => {
  const articleId = req.params.articleid;

  if (!mongoose.isValidObjectId(articleId)) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'article not found'
      }
    });
  }

  const article = await Article.findById(articleId).populate('author', 'username').exec();

  if (!article) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'article not found'
      }
    });
  }

  // delete comments
  if (article.comments.length > 0) {
    await Comment.deleteMany({ _id: { $in: article.comments } });
  }

  await article.deleteOne();

  return res.json({
    status: 'success',
    data: null
  });
});

exports.listArticlesGet = asyncHandler(async (req, res) => {
  const itemsPerPage = 9;
  const page = req.query.page || 1;
  const skip = (page - 1) * itemsPerPage;
  const query = { published: true };

  const countPromise = Article.countDocuments(query);
  const articlesPromise = Article.find(query).sort('-createdAt').limit(itemsPerPage).skip(skip).populate('author', 'username').select('-content -comments');

  const [totalItems, articles] = await Promise.all([countPromise, articlesPromise]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return res.json({
    status: 'success',
    data: {
      itemsPerPage,
      totalItems,
      currentItemCount: articles.length,
      totalPages,
      posts: articles
    }
  });
});

// TODO find a better solution later
exports.listAllArticles = asyncHandler(async (req, res) => {
  const itemsPerPage = 9;
  const page = req.query.page || 1;
  // const status = req.query.status;
  const skip = (page - 1) * itemsPerPage;
  const query = {};

  if (req.query.published) {
    query.published = req.query.published;
  }

  const countPromise = Article.countDocuments(query);
  const articlesPromise = Article.find(query).sort('-createdAt').limit(itemsPerPage).skip(skip).populate('author', 'username').select('-content -comments');

  const [totalItems, articles] = await Promise.all([countPromise, articlesPromise]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return res.json({
    status: 'success',
    data: {
      itemsPerPage,
      totalItems,
      currentItemCount: articles.length,
      totalPages,
      posts: articles
    }
  });
});

exports.testDeleteAllArticles = asyncHandler(async (req, res) => {
  const articles = Article.find({});

  await articles.deleteMany();

  return res.json({
    message: 'its done'
  });
});
