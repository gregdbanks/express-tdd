const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    reportedAt: {
        type: Date,
        default: Date.now,
    },
    incident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
        required: true,
    },
    files: [
        {
            fileUrl: {
                type: String,
                required: true,
            },
            fileType: {
                type: String,
                required: true,
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

module.exports = mongoose.model("Report", ReportSchema);