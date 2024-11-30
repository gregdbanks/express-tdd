const Report = require("../models/Report");
const asyncHandler = require("../middleware/async");

const createReport = asyncHandler(async (req, res) => {
    const { title, content, status, incident } = req.body;
    let report = new Report({ title, content, status, incident });
    await report.save();
    res.status(201).json(report);
});

const getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ incident: req.params.incidentId });
    res.status(200).json(reports);
});

const getReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
        return res.status(404).json({ error: "Report not found" });
    }
    res.status(200).json(report);
});

const updateReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const { title, content, status } = req.body;
    const report = await Report.findByIdAndUpdate(
        reportId,
        { title, content, status },
        { new: true, runValidators: true }
    );
    if (!report) {
        return res.status(404).json({ error: "Report not found" });
    }
    res.status(200).json(report);
});

const deleteReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const report = await Report.findByIdAndDelete(reportId);
    if (!report) {
        return res.status(404).json({ error: "Report not found" });
    }
    res.status(200).json({ message: "Report deleted successfully" });
});

module.exports = {
    createReport,
    getReports,
    getReport,
    updateReport,
    deleteReport,
};