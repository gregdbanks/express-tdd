const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../index');
const User = require('../models/User');

module.exports = function () {
    describe("Authentication", () => {
        describe("POST /api/v1/auth/register", () => {
            it("should return success message for register route", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/register")
                    .send({
                        name: "John Doe",
                        email: "johndoe@example.com",
                        password: "password123",
                        role: "pilot"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("success", true);
                expect(response.body).toHaveProperty("message", "Register route");
            });

            it("should hash the password before saving to the database", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/register")
                    .send({
                        name: "Jane Doe",
                        email: "janedoe@example.com",
                        password: "password123",
                        role: "user"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("success", true);

                const user = await User.findOne({ email: "janedoe@example.com" }).select("+password");

                const isPasswordMatch = await bcrypt.compare("password123", user.password);
                expect(isPasswordMatch).toBe(true);
                expect(user.password).not.toBe("password123");
            });
        });
    });
};