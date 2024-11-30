const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");

router
    .route("/missions")
    .post(missionController.createMission)
    .get(missionController.getMissions);

router
    .route("/missions/:id")
    .get(missionController.getMission)
    .put(missionController.updateMission)
    .delete(missionController.deleteMission);

module.exports = router;