const request = require('supertest');
const app = require('../index');

module.exports = function () {
    describe('Middleware Tests', () => {
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

        describe('Modify Results Middleware', () => {
            let missionId;

            it('should generate a slug for the mission', async () => {
                const mission = {
                    name: 'Test Slug Mission',
                    description: 'A mission to test slug generation',
                    status: 'pending',
                    commander: 'Test Commander'
                };

                const response = await request(app)
                    .post('/api/missions')
                    .send(mission);

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('slug', 'test-slug-mission');
                missionId = response.body._id;
            });

            it('should filter results based on query parameters and not include results with other statuses', async () => {
                const response = await request(app).get('/api/missions?status=pending');
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
                const response = await request(app).get('/api/missions?status[in]=pending,completed&createdAt[gt]=2024-01-01');
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toEqual(expect.any(Array));
                response.body.data.forEach(mission => {
                    expect(['pending', 'completed']).toContain(mission.status);
                    expect(['in progress']).toNotContain(mission.status);
                    expect(new Date(mission.createdAt)).toBeGreaterThan(new Date('2024-01-01'));
                });
            });
        });
    });
};