const request = require('supertest');
const app = require('../index');

module.exports = function () {
    describe("Incidents", () => {
        let missionId;
        let incidentId;

        describe("POST /api/missions/:missionId/incidents", () => {
            it("should create a new incident for a mission", async () => {
                const mission = {
                    name: "Rescue the Jedi",
                    description: "Rescue the Jedi from Jabba the Hutt.",
                    status: "pending",
                    commander: "Leia Organa",
                };

                const missionResponse = await request(app)
                    .post("/api/missions")
                    .send(mission);
                missionId = missionResponse.body._id;

                const incident = {
                    title: "Locate Luke Skywalker",
                    description: "Find out where Han Solo is being held.",
                    status: "pending",
                    mission: missionId,
                };

                const response = await request(app)
                    .post(`/api/missions/${missionId}/incidents`)
                    .send(incident);
                incidentId = response.body._id;
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("title", "Locate Luke Skywalker");
                incidentId = response.body._id;
            });
        });

        describe("GET /api/missions/:missionId/incidents", () => {
            it("should get all incidents for a mission", async () => {
                const response = await request(app).get(
                    `/api/missions/${missionId}/incidents`
                );
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });

        describe("GET /api/incidents/:id", () => {
            it("should get a single incident by id", async () => {
                const response = await request(app).get(`/api/incidents/${incidentId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Locate Luke Skywalker");
            });
        });
    });
};