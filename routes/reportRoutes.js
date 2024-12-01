const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

router
    .route("/missions/:missionId/incidents/:incidentId/reports")
    .post(protect, authorize('pilot', 'commander'), reportController.createReport)
    .get(reportController.getReports);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId")
    .get(reportController.getReport)
    .put(protect, authorize('pilot', 'commander'), reportController.updateReport)
    .delete(protect, authorize('pilot', 'commander'), reportController.deleteReport);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/upload")
    .post(protect, authorize('pilot', 'commander'), reportController.uploadFile);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/files")
    .get(reportController.getFilesFromReport);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/files/:fileId")
    .get(reportController.getFileFromReport)
    .delete(protect, authorize('pilot', 'commander'), reportController.deleteFileFromReport);

module.exports = router;