const express = require('express');
const passport = require('passport');
const router = express.Router();

const userController = require('../controllers/userController');
const articleController = require('../controllers/articleController');
const commentController = require('../controllers/commentController');
const restrictTo = require('../middleware/restrictTo');
const checkProfanity = require('../middleware/checkProfanity');

// auth
router.post('/users', userController.createAccountPost);
router.post('/login', userController.loginPost);

// articles
router.get('/posts', articleController.listArticlesGet);
router.get('/admin/posts', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.listAllArticles);
router.get('/admin/posts/:articleid', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.readAnyArticleGet);
router.get('/posts/:articleid', articleController.readArticleGet);
router.post('/posts', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.createArticlePost);
router.put('/posts/:articleid', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.updateArticlePut);
router.delete('/posts/:articleid', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.deleteArticle);

// comments
router.get('/posts/:articleid/comments', passport.authenticate('jwt', { session: false }), restrictTo('admin'), commentController.listCommentsGet);
router.post('/posts/:articleid/comments', checkProfanity, commentController.createCommentPost);
router.delete('/comments/:commentid', passport.authenticate('jwt', { session: false }), restrictTo('admin'), commentController.deleteComment);

// TODO remove this
router.delete('/nuke', passport.authenticate('jwt', { session: false }), restrictTo('admin'), articleController.testDeleteAllArticles);

// Test
router.get('/ip', (request, response) => response.send(request.ip));

module.exports = router;
