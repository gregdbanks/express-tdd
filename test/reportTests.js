const request = require('supertest');
const app = require('../index');

module.exports = function () {
    describe("Reports", () => {
        let missionId;
        let incidentId;
        let reportId;

        beforeAll(async () => {
            const mission = {
                name: "Rescue the Jedi Now",
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

            const incidentResponse = await request(app)
                .post(`/api/missions/${missionId}/incidents`)
                .send(incident);
            incidentId = incidentResponse.body._id;
        });

        describe("POST /api/missions/:missionId/incidents/:incidentId/reports", () => {
            it("should create a new report for an incident", async () => {
                const report = {
                    title: "Found Luke",
                    content: "Luke was found near the Sarlacc pit.",
                    status: "open",
                    incident: incidentId,
                };

                const response = await request(app)
                    .post(`/api/missions/${missionId}/incidents/${incidentId}/reports`)
                    .send(report);
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("title", "Found Luke");
                reportId = response.body._id;
            });
        });

        describe("GET /api/missions/:missionId/incidents/:incidentId/reports", () => {
            it("should get all reports for an incident", async () => {
                const response = await request(app).get(
                    `/api/missions/${missionId}/incidents/${incidentId}/reports`
                );
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });

        describe("GET /api/missions/:missionId/incidents/:incidentId/reports/:reportId", () => {
            it("should get a single report for an incident", async () => {
                const response = await request(app).get(
                    `/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`
                );
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Found Luke");
            });
        });

        describe("PUT /api/missions/:missionId/incidents/:incidentId/reports/:reportId", () => {
            it("should update an existing report", async () => {
                const updatedReport = {
                    title: "Rescued Luke",
                    content: "Luke was rescued from the Sarlacc pit.",
                    status: "closed",
                };

                const response = await request(app)
                    .put(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`)
                    .send(updatedReport);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Rescued Luke");
                expect(response.body).toHaveProperty("status", "closed");
            });
        });

        describe("DELETE /api/missions/:missionId/incidents/:incidentId/reports/:reportId", () => {
            it("should delete an existing report", async () => {
                const response = await request(app).delete(
                    `/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`
                );
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty(
                    "message",
                    "Report deleted successfully"
                );
            });

            it("should return 404 for a deleted report", async () => {
                const response = await request(app).get(
                    `/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`
                );
                expect(response.status).toBe(404);
            });
        });
    });
};