const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "resolved", "unresolved"],
        default: "pending",
    },
    reportedAt: {
        type: Date,
        default: Date.now,
    },
    mission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mission",
        required: true,
    },
});

module.exports = mongoose.model("Incident", IncidentSchema);