"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var generateToken = function (userId) {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
exports.generateToken = generateToken;
