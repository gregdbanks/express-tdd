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
            console.log('missionResponse', missionResponse.body);

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
            console.log('incidentId', incidentId);
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
    });
};