const Comment = require('../models/comment');
const Article = require('../models/article');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.createCommentPost = [
  body('author', 'title must contain at least 2 characters')
    .trim()
    .isLength({ min: 1, max: 36 })
    .escape(),

  body('content', 'content must contain at least 2 characters')
    .trim()
    .isLength({ min: 2, max: 255 })
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

    const articleid = req.params.articleid;
    const article = await Article.findById(articleid);

    if (!article) return res.sendStatus(404);

    const comment = new Comment({
      parent: articleid,
      author: req.body.author,
      content: req.body.content
    });

    const createdComment = await comment.save();

    article.comments.push(createdComment._id);
    await article.save();

    return res.json({
      success: true,
      msg: 'comment created'
    });
  })
];

exports.listCommentsGet = asyncHandler(async (req, res) => {
  const articleid = req.params.articleid;
  const comments = await Article.findById(articleid).select('comments').populate('comments');

  if (comments.comments.length <= 0) return res.sendStatus(404);

  return res.json(comments.comments);
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const commentid = req.params.commentid;
  const comment = await Comment.findById(commentid).exec();

  if (!comment) return res.sendStatus(404);

  const article = await Article.findById(comment.parent).exec();
  article.comments.pull(commentid);

  await Promise.all([
    article.save(),
    comment.deleteOne()
  ]);

  return res.json({
    success: true,
    msg: 'comment deleted'
  });
});
