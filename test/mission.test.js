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

    describe('Async Error Handling Middleware', () => {
        it('should catch errors and pass them to the error handler', async () => {
            const response = await request(app).get('/api/missions/non-existent-route');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Resource not found');
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
    });
});


