const express = require("express");
const dotenv = require("dotenv");
// const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Mission = require("./models/Mission");

dotenv.config({ path: "./config/config.env" });

const app = express();

// const connectDb = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("Connected to the database");
//     } catch (error) {
//         console.error(error.message);
//         process.exit(1);
//     }
// };

// connectDb();

const createMission = async (req, res) => {
    try {
        const { name, description, status, commander } = req.body;
        let mission = new Mission({ name, description, status, commander });
        await mission.save();
        res.status(201).json(mission);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Mission with this name already exists" });
        } else if (err.kind === "ObjectId" && err.name === "CastError") {
            res.status(404).json({ error: "Mission not found" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

app.use(bodyParser.json());

app.post("/api/missions", createMission);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`));

module.exports = app;