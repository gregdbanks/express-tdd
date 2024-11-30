const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");

router
    .route("/missions/:missionId/incidents")
    .post(incidentController.createIncident);

module.exports = router;