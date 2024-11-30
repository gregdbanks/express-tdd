const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");

beforeAll(async () => {
    await connectDb();
});

afterAll(async () => {
    await disconnectDb();
    await mongoose.connection.close();
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

    describe("GET /api/missions", () => {
        it("should get all missions", async () => {
            const response = await request(app).get("/api/missions");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});


