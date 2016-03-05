var express = require('express');
var router = express.Router();
var socketListener = require('../sockets.js');

/* GET chat. */
router.get('/', function(req, res, next) {
  res.render('chat', { title: 'Simple Chat With NodeJS' });
});


module.exports = router;
