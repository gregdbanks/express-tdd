const Mission = require("../models/Mission");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");

beforeAll(async () => {
    await connectDb();
    await Mission.deleteMany({});
    await Incident.deleteMany({});
    await Report.deleteMany({});
});

afterAll(async () => {
    await disconnectDb();
    await mongoose.connection.close();
});

const missionTests = require('./missionTests');
const incidentTests = require('./incidentTests');
const middlewareTests = require('./middlewareTests.js');
const reportTests = require('./reportTests.js');

describe("Missions API", () => {
    missionTests();
    incidentTests();
    middlewareTests();
    reportTests();
});