const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const modifiedResults = require("../middleware/modifiedResults");
const Mission = require("../models/Mission");

router
    .route("/missions")
    .post(missionController.createMission)
    .get(modifiedResults(Mission, 'incidents'), missionController.getMissions);

router
    .route("/missions/:id")
    .get(missionController.getMission)
    .put(missionController.updateMission)
    .delete(missionController.deleteMission);

module.exports = router;