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

module.exports = {
    createIncident,
    getIncidents
};