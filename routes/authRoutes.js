const express = require('express');
const { register } = require('../controllers/authController');
const router = express.Router();

router.post('/v1/auth/register', register);

module.exports = router;