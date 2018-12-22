var express = require('express');
var router = express.Router();

const auth = require('./auth');
const shop = require('./shop');

router.use('/auth', auth);
router.use('/shop', shop);
module.exports = router;
