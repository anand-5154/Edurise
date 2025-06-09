"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpExpiry = void 0;
exports.default = generateOtp;
var otp_generator_1 = require("otp-generator");
function generateOtp() {
    var otp = otp_generator_1.default.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
    return otp;
}
exports.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
