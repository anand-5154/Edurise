"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
    },
    googleId: {
        type: String
    },
    phone: {
        type: String,
        sparse: true,
    },
    role: {
        type: String,
        enum: ["user", "admin", "instructor"],
        default: "user"
    },
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model("User", userSchema);
