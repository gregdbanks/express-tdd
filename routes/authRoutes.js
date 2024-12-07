const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');
const router = express.Router();

router.post('/v1/auth/register', register);
router.post('/v1/auth/login', login);
router.post('/v1/auth/forgotpassword', forgotPassword);
router.put('/v1/auth/resetpassword/:resettoken', resetPassword);

module.exports = router;