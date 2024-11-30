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
    .put(reportController.updateReport);

module.exports = router;