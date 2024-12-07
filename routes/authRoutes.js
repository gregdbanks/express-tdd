const express = require('express');
const { register, login, forgotPassword } = require('../controllers/authController');
const router = express.Router();

router.post('/v1/auth/register', register);
router.post('/v1/auth/login', login);
router.post('/v1/auth/forgotpassword', forgotPassword);

module.exports = router;