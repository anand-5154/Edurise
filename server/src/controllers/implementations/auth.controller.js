"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authcontroller = void 0;
var statusCodes_1 = require("../../constants/statusCodes");
var generateToken_1 = require("../../utils/generateToken");
var Authcontroller = /** @class */ (function () {
    function Authcontroller(authService) {
        this.authService = authService;
    }
    Authcontroller.prototype.signup = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, user, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        email = req.body.email;
                        return [4 /*yield*/, this.authService.registerUser(email)];
                    case 1:
                        user = _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json({ message: "Otp sent successfully" });
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Authcontroller.prototype.signin = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, user, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, email = _a.email, password = _a.password;
                        return [4 /*yield*/, this.authService.loginUser(email, password)];
                    case 1:
                        user = _b.sent();
                        res.status(statusCodes_1.httpStatus.OK).json({ user: user });
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _b.sent();
                        if (err_2.message === "User doesn't exist" || err_2.message === "Invalid password") {
                            res.status(statusCodes_1.httpStatus.UNAUTHORIZED).json({ message: err_2.message });
                        }
                        else {
                            res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Authcontroller.prototype.verifyOtp = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userData, user, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userData = req.body;
                        console.log(userData);
                        return [4 /*yield*/, this.authService.verifyOtp(userData)];
                    case 1:
                        user = _a.sent();
                        res.status(statusCodes_1.httpStatus.CREATED).json({ user: user, message: "User Registered Successfully" });
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Authcontroller.prototype.googleAuth = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                if (!req.user) {
                    res.status(statusCodes_1.httpStatus.UNAUTHORIZED).json({ message: "Authentication failed" });
                    return [2 /*return*/];
                }
                token = (0, generateToken_1.generateToken)(req.user.id);
                res.redirect("http://localhost:5173/?token=".concat(token));
                return [2 /*return*/];
            });
        });
    };
    Authcontroller.prototype.forgotPassword = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, user, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        email = req.body.email;
                        return [4 /*yield*/, this.authService.handleForgotPassword(email)];
                    case 1:
                        user = _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json({ message: "OTP Sent Successfully" });
                        return [3 /*break*/, 3];
                    case 2:
                        err_4 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Authcontroller.prototype.verifyForgotOtp = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, userData, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data = req.body;
                        return [4 /*yield*/, this.authService.verifyForgotOtp(data)];
                    case 1:
                        userData = _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json({ message: 'OTP verified.' });
                        return [3 /*break*/, 3];
                    case 2:
                        err_5 = _a.sent();
                        res.status(statusCodes_1.httpStatus.NOT_FOUND).json(err_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Authcontroller.prototype.resetPassword = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data = req.body;
                        return [4 /*yield*/, this.authService.handleResetPassword(data)];
                    case 1:
                        _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json({ message: "Password resetted successfully" });
                        return [3 /*break*/, 3];
                    case 2:
                        err_6 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Authcontroller.prototype.resentOtp = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        email = req.body.email;
                        return [4 /*yield*/, this.authService.handleResendOtp(email)];
                    case 1:
                        _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json({ message: "OTP resent Successsfully!" });
                        return [3 /*break*/, 3];
                    case 2:
                        err_7 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Authcontroller;
}());
exports.Authcontroller = Authcontroller;
