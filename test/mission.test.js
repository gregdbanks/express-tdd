const request = require("supertest");
const mongoose = require("mongoose");

const Mission = require("../models/Mission");
const app = require("../index");
const { connectDb, disconnectDb } = require("../config/db");

beforeAll(async () => {
    await connectDb();
    await Mission.deleteMany({});
});

afterAll(async () => {
    await disconnectDb();
    await mongoose.connection.close();
});

describe("Missions API", () => {
    let id = new Date().getMilliseconds();
    let missionId;

    describe("POST /api/missions", () => {
        it("should create a new mission", async () => {
            const mission = {
                name: "Rescue Princess Leia" + id,
                description: "Rescue Princess Leia from the Death Star.",
                status: "pending",
                commander: "Luke Skywalker",
            };

            const response = await request(app).post("/api/missions").send(mission);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("name", "Rescue Princess Leia" + id);
            missionId = response.body._id;
        });
    });

    describe("GET /api/missions", () => {
        it("should get all missions", async () => {
            const response = await request(app).get("/api/missions");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe("GET /api/missions/:id", () => {
        it("should get a single mission by id", async () => {
            const response = await request(app).get(`/api/missions/${missionId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty(
                "name",
                "Rescue Princess Leia" + id
            );
            expect(response.body).toHaveProperty("status", "pending");
        });
    });

    describe("PUT /api/missions/:id", () => {
        it("should update an existing mission", async () => {
            const updatedMission = {
                name: "Destroy the Death Star",
                description: "Destroy the Death Star using the Rebel fleet.",
                status: "in progress",
                commander: "Luke Skywalker",
            };

            const response = await request(app)
                .put(`/api/missions/${missionId}`)
                .send(updatedMission);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty(
                "name",
                "Destroy the Death Star"
            );
            expect(response.body).toHaveProperty("status", "in progress");
        });
    });

    describe("DELETE /api/missions/:id", () => {
        it("should delete an existing mission", async () => {
            const response = await request(app).delete(
                `/api/missions/${missionId}`
            );
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty(
                "message",
                "Mission deleted successfully"
            );
        });

        it("should return 404 for a deleted mission", async () => {
            const response = await request(app).get(`/api/missions/${missionId}`);
            expect(response.status).toBe(404);
        });
    });
});

describe('Error Handling Middleware', () => {
    it('should handle CastError', async () => {
        const response = await request(app).get('/api/missions/invalid-id');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Resource not found');
    });

    it('should handle Duplicate Key Error', async () => {
        const mission = {
            name: 'Duplicate Mission',
            description: 'A mission to test duplicate key error',
            status: 'pending',
            commander: 'Test Commander'
        };

        // Create the first mission
        await request(app)
            .post('/api/missions')
            .send(mission);

        // Attempt to create a duplicate mission
        const response = await request(app)
            .post('/api/missions')
            .send(mission);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Duplicate field value entered');
    });

    it('should handle ValidationError', async () => {
        const partialMission = {
            name: '',
            description: 'A mission to test duplicate key error',
            status: 'pending',
            commander: 'Test Commander'
        };

        const response = await request(app)
            .post('/api/missions')
            .send(partialMission);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Path `name` is required.');
    });
});


