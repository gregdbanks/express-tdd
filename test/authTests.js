const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../index');
const User = require('../models/User');
const { setupAuthenticatedUser, authRequest } = require('./testUtil');

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
            it("should return a valid JWT token upon successful login", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/login")
                    .send({
                        email: "test@example.com",
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
                        email: "test@example.com",
                        password: "wrongpassword"
                    });

                expect(response.status).toBe(401);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Invalid credentials");
            });
        });
    });

    describe("Role-Based Access Control", () => {
        let authReqPilot, authReqUser;

        beforeAll(async () => {
            ({ authReq: authReqPilot } = await setupAuthenticatedUser({
                name: "Pilot User",
                email: "pilot@example.com",
                password: "password123",
                role: "pilot"
            }));

            ({ authReq: authReqUser } = await setupAuthenticatedUser({
                name: "Regular User",
                email: "user@example.com",
                password: "password123",
                role: "user"
            }));
        });

        describe("POST /api/missions", () => {
            it("should allow access for a pilot", async () => {
                const response = await authReqPilot
                    .post("/api/missions")
                    .send({
                        name: "Recon Mission",
                        description: "A recon mission to survey the area.",
                        status: "pending",
                        commander: "patton"
                    });

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("name", "Recon Mission");
            });

            it("should deny access for a regular user", async () => {
                const response = await authReqUser
                    .post("/api/missions")
                    .send({
                        name: "Stealth Mission",
                        description: "A stealth mission for infiltration.",
                        status: "pending",
                        commander: "sheeny mullet"
                    });

                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty(
                    "message",
                    "User role user is not authorized to access this route"
                );
            });
        });
    });

    describe("Password Reset", () => {
        let userEmail = "resetuser@example.com";

        // Create a user that we can test the password reset on
        beforeAll(async () => {
            await User.create({
                name: "Reset User",
                email: userEmail,
                password: "password123",
                role: "user",
            });
        });

        describe("POST /api/v1/auth/forgotpassword", () => {
            it("should send a reset email if the user exists", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/forgotpassword")
                    .send({ email: userEmail });

                // You may want to mock sendEmail in a real test scenario to not actually send emails
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("success", true);
                expect(response.body).toHaveProperty("data", "Email sent");

                // Optionally, you could retrieve the user and check if resetPasswordToken and resetPasswordExpire are set.
                const user = await User.findOne({ email: userEmail });
                expect(user.resetPasswordToken).toBeDefined();
                expect(user.resetPasswordExpire).toBeDefined();
            });

            it("should return 404 if the user does not exist", async () => {
                const response = await request(app)
                    .post("/api/v1/auth/forgotpassword")
                    .send({ email: "doesnotexist@example.com" });

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "User not found");
            });
        });

        describe("PUT /api/v1/auth/resetpassword/:resettoken", () => {
            let resetToken;
            const userEmail = "resetuser@example.com";

            beforeAll(async () => {
                // Ensure the test environment is clean
                await User.deleteMany({});

                // Create a test user
                const user = await User.create({
                    name: "Reset User",
                    email: userEmail,
                    password: "password123",
                    role: "user",
                });

                // Generate a reset token
                resetToken = user.getResetPasswordToken();
                await user.save({ validateBeforeSave: false });
            });

            it("should reset the password with a valid token", async () => {
                const response = await request(app)
                    .put(`/api/v1/auth/resetpassword/${resetToken}`)
                    .send({ password: "newpassword123" });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("success", true);

                // Verify that the password was updated
                const user = await User.findOne({ email: userEmail }).select("+password");
                const isPasswordMatch = await bcrypt.compare("newpassword123", user.password);
                expect(isPasswordMatch).toBe(true);

                // Ensure the reset token and expiry are cleared
                expect(user.resetPasswordToken).toBeUndefined();
                expect(user.resetPasswordExpire).toBeUndefined();
            });

            it("should return 400 for invalid token", async () => {
                const response = await request(app)
                    .put("/api/v1/auth/resetpassword/invalidtoken")
                    .send({ password: "newpassword123" });

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body).toHaveProperty("message", "Invalid token");
            });

            it("should return 400 if no password is provided", async () => {
                // const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

                const response = await request(app)
                    .put(`/api/v1/auth/resetpassword/${resetToken}`)
                    .send({});

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty("success", false);
                expect(response.body.message).toContain("Password is required");
            });
        });
    });
};
