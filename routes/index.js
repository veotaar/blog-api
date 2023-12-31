const express = require('express');
const passport = require('passport');
const router = express.Router();

const userController = require('../controllers/userController');
const articleController = require('../controllers/articleController');

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  res.status(200);
  res.json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

router.get('/', (req, res) => {
  res.json({ msg: 'oldu mu' });
});

router.post('/users', userController.createAccountPost);
router.post('/login', userController.loginPost);

router.post('/posts', passport.authenticate('jwt', { session: false }), articleController.createArticlePost);
router.get('/posts/:articleid', articleController.readArticleGet);
router.put('/posts/:articleid', passport.authenticate('jwt', { session: false }), articleController.updateArticlePut);
router.delete('/posts/:articleid', passport.authenticate('jwt', { session: false }), articleController.deleteArticle);

module.exports = router;
