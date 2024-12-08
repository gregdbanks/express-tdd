const express = require('express');
const {
    register, login, forgotPassword, resetPassword, getMe, updateDetails, updatePassword
} = require('../controllers/authController');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/v1/auth/register', register);
router.post('/v1/auth/login', login);
router.post('/v1/auth/forgotpassword', forgotPassword);
router.put('/v1/auth/resetpassword/:resettoken', resetPassword);
router.get('/v1/auth/me', protect, getMe);
router.put('/v1/auth/updatedetails', protect, updateDetails);
router.put('/v1/auth/updatepassword', protect, updatePassword);

module.exports = router;