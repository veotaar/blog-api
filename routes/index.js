const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/', (req, res) => {
  res.json({ msg: 'oldu mu' });
});

router.post('/users', userController.createAccountPost);

module.exports = router;
