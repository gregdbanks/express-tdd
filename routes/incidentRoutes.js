const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const incidentController = require("../controllers/incidentController");

router
    .route("/missions/:missionId/incidents")
    .post(protect, incidentController.createIncident)
    .get(incidentController.getIncidents);

router
    .route("/incidents/:id")
    .get(incidentController.getIncident)
    .put(protect, incidentController.updateIncident)
    .delete(protect, incidentController.deleteIncident);

module.exports = router;