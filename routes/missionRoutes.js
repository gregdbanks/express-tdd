const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");

router
    .route("/missions")
    .post(missionController.createMission);

module.exports = router;