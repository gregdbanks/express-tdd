const Report = require("../models/Report");
const asyncHandler = require("../middleware/async");

const createReport = asyncHandler(async (req, res) => {
    const { title, content, status, incident } = req.body;
    let report = new Report({ title, content, status, incident });
    await report.save();
    res.status(201).json(report);
});

module.exports = {
    createReport
};