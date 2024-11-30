const Incident = require("../models/Incident");
const asyncHandler = require("../middleware/async");

const createIncident = asyncHandler(async (req, res) => {
    const { title, description, status, mission } = req.body;
    let incident = new Incident({ title, description, status, mission });
    await incident.save();
    res.status(201).json(incident);
});

module.exports = {
    createIncident
};