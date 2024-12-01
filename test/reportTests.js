const request = require('supertest');
const path = require("path");

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

        describe("POST /api/missions/:missionId/incidents/:incidentId/reports/:reportId/upload", () => {
            const missionId = "6d713995b721c3bb38c1f5d0";
            const incidentId = "6d713995b721c3bb38c1f5d1";
            const reportId = "7d713995b721c3bb38c1f5d2";

            it("should upload an image file to an existing report", async () => {
                const response = await request(app)
                    .post(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/upload`)
                    .attach("file", path.resolve(__dirname, "../_data/files/reportImage.jpg"));

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("message", "File uploaded and added to report successfully");
                expect(response.body).toHaveProperty("fileUrl");
            });

            it("should upload a video file to an existing report", async () => {
                jest.setTimeout(10000); // video uploads can timeout so adjust according to your needs
                const response = await request(app)
                    .post(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/upload`)
                    .attach("file", path.resolve(__dirname, "../_data/files/reportVideo.mp4"));

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("message", "File uploaded and added to report successfully");
                expect(response.body).toHaveProperty("fileUrl");
            });
        });

        describe("GET /api/missions/:missionId/incidents/:incidentId/reports/:reportId/files", () => {
            const missionId = "6d713995b721c3bb38c1f5d0";
            const incidentId = "6d713995b721c3bb38c1f5d1";
            const reportId = "7d713995b721c3bb38c1f5d2";

            it("should retrieve a list of files associated with a report", async () => {
                const response = await request(app)
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files`);

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("files");
                expect(Array.isArray(response.body.files)).toBe(true);
                expect(response.body.files.length).toBeGreaterThan(0);
            });

            it("should retrieve a specific file associated with a report", async () => {
                const listResponse = await request(app)
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files`);

                expect(listResponse.status).toBe(200);
                expect(listResponse.body).toHaveProperty("files");
                const files = listResponse.body.files;
                expect(Array.isArray(files)).toBe(true);
                expect(files.length).toBeGreaterThan(0);

                const fileId = files[0]._id;
                const response = await request(app)
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files/${fileId}`);

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("fileUrl");
                expect(response.body).toHaveProperty("fileType");
            });

            it("should return 404 if a report or file is not found", async () => {
                const response = await request(app)
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files/invalidFileId`);

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty("error", "File not found");
            });
        });
    });
};