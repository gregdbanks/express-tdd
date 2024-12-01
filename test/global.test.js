const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");
const { importData, deleteData } = require('../seeder');

beforeAll(async () => {
    await connectDb();
    await deleteData(); // Clear any existing data
    await importData(); // Import the test data
});

afterAll(async () => {
    await deleteData(); // Clear data after tests
    await disconnectDb();
    await mongoose.connection.close();
});

const missionTests = require('./missionTests');
const incidentTests = require('./incidentTests');
const reportTests = require('./reportTests');
const middlewareTests = require('./middlewareTests');

describe("Missions API", () => {
    missionTests();
    incidentTests();
    reportTests();
    middlewareTests();
});
