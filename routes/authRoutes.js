const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/v1/auth/register', register);
router.post('/v1/auth/login', login);

module.exports = router;