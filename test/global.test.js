const Mission = require("../models/Mission");
const Incident = require("../models/Incident");
const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");

beforeAll(async () => {
    await connectDb();
    await Mission.deleteMany({});
    await Incident.deleteMany({});
});

afterAll(async () => {
    await disconnectDb();
    await mongoose.connection.close();
});

const missionTests = require('./missionTests');
const incidentTests = require('./incidentTests');
const middlewareTests = require('./middlewareTests.js');

describe("Missions API", () => {
    missionTests();
    incidentTests();
    middlewareTests();
});