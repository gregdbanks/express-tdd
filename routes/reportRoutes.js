const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

router
    .route("/missions/:missionId/incidents/:incidentId/reports")
    .post(protect, reportController.createReport)
    .get(reportController.getReports);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId")
    .get(reportController.getReport)
    .put(protect, reportController.updateReport)
    .delete(protect, reportController.deleteReport);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/upload")
    .post(protect, reportController.uploadFile);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/files")
    .get(reportController.getFilesFromReport);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/files/:fileId")
    .get(reportController.getFileFromReport)
    .delete(protect, reportController.deleteFileFromReport);

module.exports = router;