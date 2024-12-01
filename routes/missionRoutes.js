const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const Mission = require("../models/Mission");
const modifiedResults = require("../middleware/modifiedResults");
const { protect, authorize } = require("../middleware/auth");

router
    .route("/missions")
    .post(protect, authorize('pilot', 'commander'), missionController.createMission)
    .get(modifiedResults(Mission, 'incidents'), missionController.getMissions);

router.route("/missions/:id")
    .get(missionController.getMission)
    .put(protect, authorize('pilot', 'commander'), missionController.updateMission)
    .delete(protect, authorize('pilot', 'commander'), missionController.deleteMission);

module.exports = router;