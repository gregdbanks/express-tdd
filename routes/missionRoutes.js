const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const Mission = require("../models/Mission");
const modifiedResults = require("../middleware/modifiedResults");
const { protect } = require("../middleware/auth");

router
    .route("/missions")
    .post(protect, missionController.createMission)
    .get(modifiedResults(Mission, 'incidents'), missionController.getMissions);

router
    .route("/missions/:id")
    .get(missionController.getMission)
    .put(protect, missionController.updateMission)
    .delete(protect, missionController.deleteMission);

module.exports = router;