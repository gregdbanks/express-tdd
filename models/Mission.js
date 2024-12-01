const mongoose = require("mongoose");
const slugify = require("slugify");

const MissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "in progress", "completed"],
        default: "pending",
    },
    commander: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: String
});

MissionSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

module.exports = mongoose.model("Mission", MissionSchema);