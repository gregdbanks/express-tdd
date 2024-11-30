
const Mission = require("../models/Mission");

const createMission = async (req, res) => {
    try {
        const { name, description, status, commander } = req.body;
        let mission = new Mission({ name, description, status, commander });
        await mission.save();
        res.status(201).json(mission);
    } catch (err) {
        if (err.code === 11000) {
            console.log('errror', err);
            res.status(400).json({ error: "Mission with this name already exists" });
        } else if (err.kind === "ObjectId" && err.name === "CastError") {
            res.status(404).json({ error: "Mission not found" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = { createMission };