const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");
const { importData, deleteData } = require('../seeder');

beforeAll(async () => {
    await connectDb();
    await deleteData();
    await importData();
});

afterAll(async () => {
    await deleteData(); // Clear data after tests
    await disconnectDb();
    await mongoose.connection.close();
});

const missionTests = require('./missionTests');
const incidentTests = require('./incidentTests');
const middlewareTests = require('./middlewareTests');
const reportTests = require('./reportTests');

describe("Missions API", () => {
    missionTests();
    incidentTests();
    middlewareTests();
    reportTests();
});