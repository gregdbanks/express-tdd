const app = require("../index");
const mongoose = require("mongoose");

describe("Missions API", () => {
    it("should connect to database", async () => {
        try {
            console.log("Connecting to MongoDB...", process.env.MONGO_URI);
            await mongoose.connect(process.env.MONGO_URI);
            console.log("MongoDB connected...");
        } catch (err) {
            console.error(err.message);
            process.exit(1);
        };
    });
    it("should disconnect from database", async () => {
        try {
            await mongoose.disconnect();
            console.log("MongoDB disconnected...");
        } catch (err) {
            console.error(err.message);
        }
    });
});