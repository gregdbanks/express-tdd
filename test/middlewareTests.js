const Incident = require('../models/Incident');
const Report = require('../models/Report');
const { setupAuthenticatedUser } = require('./testUtil');

module.exports = function () {
    let user, authReq;

    beforeAll(async () => {
        ({ user, authReq } = await setupAuthenticatedUser());
    });

    describe('Middleware Tests', () => {
        describe('Async Error Handling Middleware', () => {
            it('should catch errors and pass them to the error handler', async () => {
                const response = await authReq.get('/api/missions/non-existent-route');
                expect(response.status).toBe(404);
                expect(response.body.error).toBe('Resource not found');
            });
        });

        describe('Error Handling Middleware', () => {
            it('should handle CastError', async () => {
                const response = await authReq.get('/api/missions/invalid-id');
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

                await authReq
                    .post('/api/missions')
                    .send(mission);

                const response = await authReq
                    .post('/api/missions')
                    .send(mission);

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Duplicate field value entered');
            });

            it('should handle ValidationError', async () => {
                const partialMission = {
                    name: '',
                    description: 'A mission to test validation error',
                    status: 'pending',
                    commander: 'Test Commander'
                };

                const response = await authReq
                    .post('/api/missions')
                    .send(partialMission);

                expect(response.status).toBe(400);
                expect(response.body.error).toContain('Path `name` is required.');
            });
        });

        describe('Modify Results Middleware', () => {
            let missionId;

            it('should generate a slug for the mission', async () => {
                const mission = {
                    name: 'Test Slug Mission',
                    description: 'A mission to test slug generation',
                    status: 'pending',
                    commander: 'Test Commander'
                };

                const response = await authReq
                    .post('/api/missions')
                    .send(mission);

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('slug', 'test-slug-mission');
                missionId = response.body._id;
            });

            it('should filter results based on query parameters and not include results with other statuses', async () => {
                const response = await authReq.get('/api/missions?status=pending');
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toEqual(expect.any(Array));
                response.body.data.forEach(mission => {
                    expect(mission.status).toBe('pending');
                    expect(mission.status).not.toBe('completed');
                    expect(mission.status).not.toBe('in-progress');
                });
            });

            it('should filter results based on query operators', async () => {
                const response = await authReq.get('/api/missions?status[in]=pending,completed&createdAt[gt]=2024-01-01');
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toEqual(expect.any(Array));
                response.body.data.forEach(mission => {
                    expect(['pending', 'completed']).toContain(mission.status);
                    expect(['in progress']).not.toContain(mission.status);
                    expect(new Date(mission.createdAt)).toBeGreaterThan(new Date('2024-01-01'));
                });
            });

            it('should select specific fields in the response', async () => {
                const response = await authReq.get('/api/missions?select=name,status');
                expect(response.status).toBe(200);
                expect(response.body.data[0]).toHaveProperty('name');
                expect(response.body.data[0]).toHaveProperty('status');
                expect(response.body.data[0]).not.toHaveProperty('description');
            });

            it('should sort the results by the specified field', async () => {
                const sortedResponse = await authReq.get('/api/missions?sort=createdAt');

                expect(sortedResponse.status).toBe(200);
                expect(sortedResponse.body.success).toBe(true);
                expect(Array.isArray(sortedResponse.body.data)).toBe(true);

                const missions = sortedResponse.body.data;

                for (let i = 1; i < missions.length; i++) {
                    const prevDate = new Date(missions[i - 1].createdAt);
                    const currentDate = new Date(missions[i].createdAt);
                    expect(prevDate <= currentDate).toBe(true);
                }
            });

            it('should paginate the results based on the provided page and limit', async () => {
                const response = await authReq.get('/api/missions?page=1&limit=2');
                expect(response.status).toBe(200);
                expect(response.body.pagination).toHaveProperty('next');
            });
        });

        describe("Cascade delete", () => {
            let missionId;
            let incidentId;
            let reportId;

            beforeAll(async () => {
                // Create a mission
                const missionData = {
                    name: 'Mission for Cascade Delete Test',
                    description: 'Testing cascade delete',
                    status: 'pending',
                    commander: 'Commander Test',
                    user: "674760631d5aba7490e31ff2"
                };
                const missionResponse = await authReq.post('/api/missions').send(missionData);
                missionId = missionResponse.body._id;

                // Create an incident associated with the mission
                const incidentData = {
                    title: 'Incident for Cascade Delete Test',
                    description: 'Testing cascade delete',
                    status: 'pending',
                    mission: missionId,
                    user: "674760631d5aba7490e31ff2"
                };
                const incident = await Incident.create(incidentData);
                incidentId = incident._id;

                // Create a report associated with the incident
                const reportData = {
                    title: 'Report for Cascade Delete Test',
                    content: 'Testing cascade delete',
                    status: 'open',
                    incident: incidentId,
                    files: []
                };
                const report = await Report.create(reportData);
                reportId = report._id;
            });

            it("should delete a mission and its associated incident and report", async () => {
                const response = await authReq.delete(`/api/missions/${missionId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("message", "Mission deleted successfully");

                const missionCheck = await authReq.get(`/api/missions/${missionId}`);
                expect(missionCheck.status).toBe(404);

                const incidentCheck = await Incident.findById(incidentId);
                expect(incidentCheck).toBeNull();

                const reportCheck = await Report.findById(reportId);
                expect(reportCheck).toBeNull();
            });
        });
    });
};
