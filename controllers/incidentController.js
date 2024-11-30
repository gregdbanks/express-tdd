const Incident = require("../models/Incident");
const asyncHandler = require("../middleware/async");

const createIncident = asyncHandler(async (req, res) => {
    const { title, description, status, mission } = req.body;
    let incident = new Incident({ title, description, status, mission });
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

module.exports = {
    createIncident,
    getIncidents,
    getIncident
};