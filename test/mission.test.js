const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");

beforeAll(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected...");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    };
});

afterAll(async () => {
    try {
        await mongoose.disconnect();
        console.log("MongoDB disconnected...");
    } catch (err) {
        console.error(err.message);
    }
});

describe("Missions API", () => {
    let id = new Date().getMilliseconds();

    describe("POST /api/missions", () => {
        it("should create a new mission", async () => {
            const mission = {
                name: "Rescue Princess Leia",
                description: "Rescue Princess Leia from the Death Star.",
                status: "pending",
                commander: "Luke Skywalker",
            };

            const response = await request(app).post("/api/missions").send(mission);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("name", "Rescue Princess Leia");
        });
    });
});
