const aws = require('aws-sdk');
const multer = require("multer");
const path = require("path");
const Report = require("../models/Report");
const Mission = require("../models/Mission");
const asyncHandler = require("../middleware/async");

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const upload = multer({ storage: multer.memoryStorage() }).single('file');

const createReport = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    const mission = await Mission.findById(req.params.missionId);

    if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
    }

    if (mission.user.toString() !== req.user.id && req.user.role !== 'commander') {
        return res.status(403).json({ error: `User ${req.user.id} does not have permission to create an report for mission ${mission._id}.` });
    }

    req.body.mission = mission._id;
    let report = new Report(req.body);
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

const uploadFile = asyncHandler(async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error("Multer Error:", err.message);
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            console.error("No File Uploaded");
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { reportId } = req.params;
        const report = await Report.findById(reportId);

        if (!report) {
            console.error("Report Not Found");
            return res.status(404).json({ error: 'Report not found' });
        }

        const params = {
            Bucket: 'missions-bucket',
            Key: `${Date.now().toString()}-${path.basename(req.file.originalname)}`,
            Body: req.file.buffer,
            ACL: 'private',
            ContentType: req.file.mimetype,
        };

        s3.upload(params, async (err, data) => {
            if (err) {
                console.error("S3 Upload Error:", err);
                return res.status(500).json({ error: 'Error uploading file' });
            }

            const newFile = {
                fileUrl: data.Location,
                fileType: req.file.mimetype,
                uploadedAt: new Date(),
            };

            report.files.push(newFile);
            await report.save();

            res.status(200).json({
                message: 'File uploaded and added to report successfully',
                fileUrl: newFile.fileUrl,
            });
        });
    });
});

const getFilesFromReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);

    if (!report) {
        return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ files: report.files });
});

const getFileFromReport = asyncHandler(async (req, res) => {
    const { reportId, fileId } = req.params;
    const report = await Report.findById(reportId);

    if (!report) {
        return res.status(404).json({ error: 'Report not found' });
    }

    const file = report.files.id(fileId);

    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }

    const params = {
        Bucket: 'missions-bucket',
        Key: path.basename(file.fileUrl),
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            console.error("S3 GetObject Error:", err);
            return res.status(500).json({ error: 'Error retrieving file' });
        }

        res.status(200).json({
            fileUrl: file.fileUrl,
            fileType: file.fileType,
            fileContent: data.Body.toString('base64'),
        });
    });
});

const deleteFileFromReport = asyncHandler(async (req, res) => {
    const { reportId, fileId } = req.params;
    const report = await Report.findById(reportId);

    if (!report) {
        return res.status(404).json({ error: 'Report not found' });
    }

    const file = report.files.id(fileId);

    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }

    const params = {
        Bucket: 'missions-bucket', // Replace with your actual S3 bucket name
        Key: path.basename(file.fileUrl),
    };

    // Delete the file from S3
    s3.deleteObject(params, async (err, data) => {
        if (err) {
            console.error("S3 DeleteObject Error:", err);
            return res.status(500).json({ error: 'Error deleting file from S3' });
        }

        // Remove the file from the report's files array
        report.files.pull(fileId);
        await report.save();

        res.status(200).json({
            message: 'File deleted successfully',
        });
    });
});

module.exports = {
    createReport,
    getReports,
    getReport,
    updateReport,
    deleteReport,
    uploadFile,
    getFilesFromReport,
    getFileFromReport,
    deleteFileFromReport
};