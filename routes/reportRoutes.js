const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router
    .route("/missions/:missionId/incidents/:incidentId/reports")
    .post(reportController.createReport)
    .get(reportController.getReports);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId")
    .get(reportController.getReport)
    .put(reportController.updateReport)
    .delete(reportController.deleteReport);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/upload")
    .post(reportController.uploadFile);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/files")
    .get(reportController.getFilesFromReport);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/files/:fileId")
    .get(reportController.getFileFromReport);

router
    .route("/missions/:missionId/incidents/:incidentId/reports/:reportId/files/:fileId")
    .delete(reportController.deleteFileFromReport);

module.exports = router;