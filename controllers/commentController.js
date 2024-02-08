const Comment = require('../models/comment');
const Article = require('../models/article');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.createCommentPost = [
  body('author', 'name must contain at least 2 characters')
    .trim()
    .isLength({ min: 1, max: 36 })
    .escape(),

  body('content', 'comment must contain at least 2 characters')
    .trim()
    .isLength({ min: 2, max: 255 })
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

    const articleid = req.params.articleid;
    const article = await Article.findById(articleid);

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'article not found'
        }
      });
    }

    // temporary solution for limiting comments
    if (article.commentCount >= 20) {
      return res.status(403).json({
        status: 'fail',
        data: {
          message: 'comment limit reached'
        }
      });
    }

    const comment = new Comment({
      parent: articleid,
      author: req.body.author,
      content: req.body.content
    });

    const createdComment = await comment.save();
    const commentId = createdComment.id;

    article.comments.push(createdComment._id);
    article.$inc('commentCount', 1);
    await article.save();

    return res.status(201).json({
      status: 'success',
      data: {
        comment: {
          id: commentId,
          articlePath: `/posts/${articleid}`
        }
      }
    });
  })
];

exports.listCommentsGet = asyncHandler(async (req, res) => {
  const articleid = req.params.articleid;
  const article = await Article.findById(articleid).select('comments').populate('comments');

  if (article.comments.length <= 0) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'no comments in article'
      }
    });
  }

  // return res.json(comments.comments);
  return res.json({
    status: 'success',
    data: {
      comments: article.comments
    }
  });
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const commentid = req.params.commentid;
  const comment = await Comment.findById(commentid).exec();

  if (!comment) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'comment not found'
      }
    });
  }

  const article = await Article.findById(comment.parent).exec();
  article.comments.pull(commentid);
  article.$inc('commentCount', -1);

  await Promise.all([
    article.save(),
    comment.deleteOne()
  ]);

  return res.json({
    status: 'success',
    data: null
  });
});
