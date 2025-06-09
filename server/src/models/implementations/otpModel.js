"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var otpSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: "5m"
    }
});
exports.default = mongoose_1.default.model("Otp", otpSchema);
