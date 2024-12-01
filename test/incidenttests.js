const { setupAuthenticatedUser } = require('./testUtil');

module.exports = function () {
    let user, authReq;

    beforeAll(async () => {
        ({ user, authReq } = await setupAuthenticatedUser());
    });

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

                const missionResponse = await authReq.post("/api/missions")
                    .send(mission);
                missionId = missionResponse.body._id;

                const incident = {
                    title: "Locate Luke Skywalker",
                    description: "Find out where Han Solo is being held.",
                    status: "pending",
                    mission: missionId,
                };

                const response = await authReq
                    .post(`/api/missions/${missionId}/incidents`)
                    .send(incident);
                incidentId = response.body._id;
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("title", "Locate Luke Skywalker");
            });
        });

        describe("GET /api/missions/:missionId/incidents", () => {
            it("should get all incidents for a mission", async () => {
                const response = await authReq.get(`/api/missions/${missionId}/incidents`);
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });

        describe("GET /api/incidents/:id", () => {
            it("should get a single incident by id", async () => {
                const response = await authReq.get(`/api/incidents/${incidentId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Locate Luke Skywalker");
            });
        });

        describe("PUT /api/incidents/:id", () => {
            it("should update an existing incident", async () => {
                const updatedIncident = {
                    title: "Free Han Solo",
                    description: "Free Han Solo from his carbonite prison.",
                    status: "resolved",
                };

                const response = await authReq
                    .put(`/api/incidents/${incidentId}`)
                    .send(updatedIncident);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Free Han Solo");
                expect(response.body).toHaveProperty("status", "resolved");
            });
        });

        describe("DELETE /api/incidents/:id", () => {
            it("should delete an existing incident", async () => {
                const response = await authReq.delete(
                    `/api/incidents/${incidentId}`
                );
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty(
                    "message",
                    "Incident deleted successfully"
                );
            });

            it("should return 404 for a deleted incident", async () => {
                const response = await authReq.get(`/api/incidents/${incidentId}`);
                expect(response.status).toBe(404);
            });
        });
    });
};
