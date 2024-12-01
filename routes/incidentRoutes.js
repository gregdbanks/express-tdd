const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const incidentController = require("../controllers/incidentController");

router
    .route("/missions/:missionId/incidents")
    .post(protect, authorize('pilot', 'commander'), incidentController.createIncident)
    .get(incidentController.getIncidents);

router
    .route("/incidents/:id")
    .get(incidentController.getIncident)
    .put(protect, authorize('pilot', 'commander'), incidentController.updateIncident)
    .delete(protect, authorize('pilot', 'commander'), incidentController.deleteIncident);

module.exports = router;