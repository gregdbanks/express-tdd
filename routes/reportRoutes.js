const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router
    .route("/missions/:missionId/incidents/:incidentId/reports")
    .post(reportController.createReport);

module.exports = router;