const path = require("path");
const { setupAuthenticatedUser } = require('./testUtil');
const Mission = require('../models/Mission');
const Incident = require('../models/Incident');

module.exports = function () {
    let user, authReq;
    let missionId;
    let incidentId;
    let reportId;

    beforeAll(async () => {
        ({ user, authReq } = await setupAuthenticatedUser());

        const mission = {
            name: "Rescue the Jedi Now",
            description: "Rescue the Jedi from Jabba the Hutt.",
            status: "pending",
            commander: "Leia Organa",
            user: user.id,
        };

        const missionResponse = await authReq
            .post("/api/missions")
            .send(mission);
        missionId = missionResponse.body._id;

        const incident = {
            title: "Locate Luke Skywalker",
            description: "Find out where Han Solo is being held.",
            status: "pending",
            mission: missionId,
        };

        const incidentResponse = await authReq
            .post(`/api/missions/${missionId}/incidents`)
            .send(incident);
        incidentId = incidentResponse.body._id;
    });

    describe("Reports", () => {
        describe("POST /api/missions/:missionId/incidents/:incidentId/reports", () => {
            it("should create a new report for an incident", async () => {
                const report = {
                    title: "Found Luke",
                    content: "Luke was found near the Sarlacc pit.",
                    status: "open",
                    incident: incidentId,
                    user: user.id,
                };

                const response = await authReq
                    .post(`/api/missions/${missionId}/incidents/${incidentId}/reports`)
                    .send(report);
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("title", "Found Luke");
                reportId = response.body._id;
            });

            it("should return 403 if the user does not have permission to create a report", async () => {
                const otherUserId = "1234567890abcdef12345678"; // A different user ID

                // Create a mission directly in the database owned by another user
                const mission = await Mission.create({
                    name: "Infiltrate the Empire Again",
                    description: "Gather intel from within the Empire.",
                    status: "pending",
                    commander: "Cassian Andor",
                    user: otherUserId, // Mission owned by another user
                });
                const otherMissionId = mission._id;

                // Create an incident directly in the database associated with the mission
                const incident = await Incident.create({
                    title: "Secure Entry Codes Again",
                    description: "Obtain codes to access Imperial facilities.",
                    status: "pending",
                    mission: otherMissionId,
                    user: otherUserId, // Incident owned by another user
                });
                const otherIncidentId = incident._id;

                // Attempt to create a report on the incident as the authenticated user
                const report = {
                    title: "Unauthorized Report",
                    content: "Attempting to create a report without permission.",
                    status: "open",
                };

                const response = await authReq
                    .post(`/api/missions/${otherMissionId}/incidents/${otherIncidentId}/reports`)
                    .send(report);

                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty("error");
            });
        });

        describe("GET /api/missions/:missionId/incidents/:incidentId/reports", () => {
            it("should get all reports for an incident", async () => {
                const response = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports`);
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });

        describe("GET /api/missions/:missionId/incidents/:incidentId/reports/:reportId", () => {
            it("should get a single report for an incident", async () => {
                const response = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`);
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

                const response = await authReq
                    .put(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`)
                    .send(updatedReport);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Rescued Luke");
                expect(response.body).toHaveProperty("status", "closed");
            });
        });

        describe("DELETE /api/missions/:missionId/incidents/:incidentId/reports/:reportId", () => {
            it("should delete an existing report", async () => {
                const response = await authReq
                    .delete(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty(
                    "message",
                    "Report deleted successfully"
                );
            });

            it("should return 404 for a deleted report", async () => {
                const response = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}`);
                expect(response.status).toBe(404);
            });
        });

        describe("POST /api/missions/:missionId/incidents/:incidentId/reports/:reportId/upload", () => {
            const missionId = "6d713995b721c3bb38c1f5d0";
            const incidentId = "6d713995b721c3bb38c1f5d1";
            const reportId = "7d713995b721c3bb38c1f5d2";

            it("should upload an image file to an existing report", async () => {
                const response = await authReq
                    .post(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/upload`)
                    .attach("file", path.resolve(__dirname, "../_data/files/reportImage.jpg"));

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("message", "File uploaded and added to report successfully");
                expect(response.body).toHaveProperty("fileUrl");
            });

            it("should upload a video file to an existing report", async () => {
                jest.setTimeout(8000);
                const response = await authReq
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
                const response = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files`);

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("files");
                expect(Array.isArray(response.body.files)).toBe(true);
                expect(response.body.files.length).toBeGreaterThan(0);
            });

            it("should retrieve a specific file associated with a report", async () => {
                const listResponse = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files`);
                expect(listResponse.status).toBe(200);
                expect(listResponse.body).toHaveProperty("files");
                const files = listResponse.body.files;
                expect(Array.isArray(files)).toBe(true);
                expect(files.length).toBeGreaterThan(0);

                const fileId = files[0]._id;
                const response = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files/${fileId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("fileUrl");
                expect(response.body).toHaveProperty("fileType");
            });

            it("should return 404 if a report or file is not found", async () => {
                const response = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files/invalidFileId`);
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty("error", "File not found");
            });
        });

        describe("DELETE /api/missions/:missionId/incidents/:incidentId/reports/:reportId/files/:fileId", () => {
            const missionId = "6d713995b721c3bb38c1f5d0";
            const incidentId = "6d713995b721c3bb38c1f5d1";
            const reportId = "7d713995b721c3bb38c1f5d2";

            it("should delete all files associated with a report", async () => {
                const listResponse = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files`);
                expect(listResponse.status).toBe(200);
                expect(listResponse.body).toHaveProperty("files");
                const files = listResponse.body.files;
                expect(Array.isArray(files)).toBe(true);
                expect(files.length).toBeGreaterThan(0);

                for (const file of files) {
                    const deleteResponse = await authReq
                        .delete(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files/${file._id}`);
                    expect(deleteResponse.status).toBe(200);
                    expect(deleteResponse.body).toHaveProperty("message", "File deleted successfully");
                }

                const finalListResponse = await authReq
                    .get(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files`);
                expect(finalListResponse.status).toBe(200);
                expect(finalListResponse.body.files.length).toBe(0);
            });

            it("should return 404 if the file to be deleted is not found", async () => {
                const response = await authReq
                    .delete(`/api/missions/${missionId}/incidents/${incidentId}/reports/${reportId}/files/invalidFileId`);
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty("error", "File not found");
            });
        });
    });
};