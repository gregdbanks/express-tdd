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
    });
};