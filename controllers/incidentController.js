const Incident = require("../models/Incident");
const Mission = require("../models/Mission");
const asyncHandler = require("../middleware/async");

const createIncident = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    const mission = await Mission.findById(req.params.missionId);

    if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
    }

    if (mission.user.toString() !== req.user.id && req.user.role !== 'commander') {
        return res.status(403).json({ error: `User ${req.user.id} does not have permission to create an incident for mission ${mission._id}.` });
    }

    req.body.mission = mission._id;
    let incident = new Incident(req.body);
    await incident.save();
    res.status(201).json(incident);
});

const getIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({ mission: req.params.missionId });
    res.status(200).json(incidents);
});

const getIncident = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
    }
    res.status(200).json(incident);
});

const updateIncident = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const incident = await Incident.findByIdAndUpdate(
        id,
        { title, description, status },
        { new: true, runValidators: true }
    );
    if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
    }
    res.status(200).json(incident);
});

const deleteIncident = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
    }
    await incident.deleteOne();
    res.status(200).json({ message: "Incident deleted successfully" });
});

module.exports = {
    createIncident,
    getIncidents,
    getIncident,
    updateIncident,
    deleteIncident
};