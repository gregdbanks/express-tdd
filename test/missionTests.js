const request = require('supertest');
const app = require('../index');

module.exports = function () {
    describe("Missions", () => {
        let id = new Date().getMilliseconds();
        let missionId;

        describe("POST /api/missions", () => {
            it("should create a new mission", async () => {
                const mission = {
                    name: "Rescue princess Leia",
                    description: "Rescue princess Leia from the Death Star.",
                    status: "pending",
                    commander: "Luke Skywalker",
                };

                const response = await request(app).post("/api/missions").send(mission);
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("name", "Rescue princess Leia");
                missionId = response.body._id;
            });
        });

        describe("GET /api/missions", () => {
            it("should get all missions", async () => {
                const response = await request(app).get("/api/missions");
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body.data)).toBe(true);
            });

            it("should get all missions and populate incidents", async () => {
                const response = await request(app).get("/api/missions");
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body.data)).toBe(true);
                response.body.data.forEach(mission => {
                    expect(mission).toHaveProperty("incidents");
                    expect(Array.isArray(mission.incidents)).toBe(true);
                });
            });
        });

        describe("GET /api/missions/:id", () => {
            it("should get a single mission by id", async () => {
                const response = await request(app).get(`/api/missions/${missionId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty(
                    "name",
                    "Rescue princess Leia"
                );
                expect(response.body).toHaveProperty("status", "pending");
            });

            it("should get a single mission by id and populate incidents", async () => {
                const response = await request(app).get(`/api/missions/${missionId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("name", "Rescue princess Leia");
                expect(response.body).toHaveProperty("status", "pending");
                expect(response.body).toHaveProperty("incidents");
                expect(Array.isArray(response.body.incidents)).toBe(true);
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
};