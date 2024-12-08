const User = require("../models/User");
const asyncHandler = require("../middleware/async");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const { data } = res.modifiedResults;

    res.status(200).json({
        success: true,
        data: data || []
    });
});

exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
});

exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: {} });
});
