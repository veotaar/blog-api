const express = require('express');
const passport = require('passport');
const router = express.Router();

const userController = require('../controllers/userController');
const articleController = require('../controllers/articleController');
const commentController = require('../controllers/commentController');
const restrictTo = require('../middleware/restrictTo');

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  res.status(200);
  res.json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

router.get('/', (req, res) => {
  res.json({ msg: 'oldu mu' });
});

// auth
router.post('/users', userController.createAccountPost);
router.post('/login', userController.loginPost);

// articles
router.get('/posts', articleController.listArticlesGet);
router.get('/admin/posts', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.listAllArticles);
router.get('/posts/:articleid', articleController.readArticleGet);
router.post('/posts', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.createArticlePost);
router.put('/posts/:articleid', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.updateArticlePut);
router.delete('/posts/:articleid', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.deleteArticle);

// comments
router.get('/posts/:articleid/comments', commentController.listCommentsGet);
router.post('/posts/:articleid/comments', commentController.createCommentPost);
router.delete('/comments/:commentid', passport.authenticate('jwt', { session: false }), commentController.deleteComment);

module.exports = router;
