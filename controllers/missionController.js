const Mission = require("../models/Mission");
const asyncHandler = require("../middleware/async");

const createMission = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    let mission = new Mission(req.body);

    if (mission.user.toString() !== req.user.id && req.user.role !== 'commander') {
        return res.status(403).json({ error: "You do not have permission to modify this mission" });
    }

    await mission.save();
    res.status(201).json(mission);
});

const getMissions = asyncHandler(async (req, res) => {
    res.status(200).json(res.modifiedResults);
});

const getMission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mission = await Mission.findById(id).populate('incidents');
    if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
    }
    res.status(200).json(mission);
});

const updateMission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let mission = await Mission.findById(id);

    if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
    }

    if (mission.user.toString() !== req.user.id && req.user.role !== 'commander') {
        return res.status(403).json({ error: "You do not have permission to modify this mission" });
    }

    const { name, description, status, commander } = req.body;
    mission = await Mission.findByIdAndUpdate(
        id,
        { name, description, status, commander },
        { new: true, runValidators: true }
    );
    res.status(200).json(mission);
});

const deleteMission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mission = await Mission.findById(id);
    if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
    }

    if (mission.user.toString() !== req.user.id && req.user.role !== 'commander') {
        return res.status(403).json({ error: "You do not have permission to delete this mission" });
    }

    await mission.deleteOne();
    res.status(200).json({ message: "Mission deleted successfully" });
});

module.exports = {
    createMission,
    getMissions,
    getMission,
    updateMission,
    deleteMission
};