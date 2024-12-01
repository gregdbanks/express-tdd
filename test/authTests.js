const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../index');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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


                const cookies = response.headers["set-cookie"];
                expect(cookies).toBeDefined();
                expect(cookies.some(cookie => cookie.startsWith("token="))).toBe(true);
            });

            it("should return a valid JWT token upon registration", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/register")
                    .send({
                        name: "Token User",
                        email: "tokenuser@example.com",
                        password: "password123",
                        role: "user"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("success", true);
                expect(response.body).toHaveProperty("token");

                const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
                expect(decoded).toHaveProperty("id");
                expect(decoded.id).toBeDefined();

                const user = await User.findOne({ email: "tokenuser@example.com" });
                expect(user).not.toBeNull();
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

        describe("POST /api/v1/auth/login", () => {
            beforeAll(async () => {
                await User.create({
                    name: "John Doe",
                    email: "john@example.com",
                    password: "password123",
                    role: "user"
                });
            });

            it("should return a valid JWT token upon successful login", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/login")
                    .send({
                        email: "john@example.com",
                        password: "password123"
                    });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("success", true);
                expect(response.body).toHaveProperty("token");
            });

            it("should return a 401 error for incorrect credentials", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/login")
                    .send({
                        email: "john@example.com",
                        password: "wrongpassword"
                    });

                expect(response.status).toBe(401);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Invalid credentials");
            });
        });
    });
};