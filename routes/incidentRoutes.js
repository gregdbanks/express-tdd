const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");

router
    .route("/missions/:missionId/incidents")
    .post(incidentController.createIncident)
    .get(incidentController.getIncidents);

router
    .route("/incidents/:id")
    .get(incidentController.getIncident)
    .put(incidentController.updateIncident);

module.exports = router;