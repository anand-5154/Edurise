"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var instructorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        requirede: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    yearsOfExperience: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "instructor", "admin"],
        default: "instructor"
    },
    education: {
        type: String,
        required: true,
        trim: true
    },
    accountStatus: {
        type: String,
        enum: ["pending", "blocked", "active"],
        default: "pending"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model("Instructor", instructorSchema);
