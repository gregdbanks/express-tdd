const Mission = require("../models/Mission");
const asyncHandler = require("../middleware/async");

const createMission = asyncHandler(async (req, res) => {
    const { name, description, status, commander } = req.body;
    let mission = new Mission({ name, description, status, commander });
    await mission.save();
    res.status(201).json(mission);
});

const getMissions = asyncHandler(async (req, res) => {
    const missions = await Mission.find();
    res.status(200).json(missions);
});

const getMission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mission = await Mission.findById(id);
    if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
    }
    res.status(200).json(mission);
});

module.exports = { createMission, getMissions, getMission };