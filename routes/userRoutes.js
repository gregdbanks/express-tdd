const express = require('express');
const {
    getAllUsers, getUser, createUser, updateUser, deleteUser
} = require('../controllers/userController');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const modifiedResults = require('../middleware/modifiedResults');

router.use(protect);
router.use(authorize('commander'));

router.route('/')
    .get(modifiedResults(User), getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(modifiedResults(User), getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
