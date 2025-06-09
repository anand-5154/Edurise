"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.InstructorAuthSerivce = void 0;
var bcrypt_1 = require("bcrypt");
var otpGenerator_1 = require("../../utils/otpGenerator");
var sendMail_1 = require("../../utils/sendMail");
var InstructorAuthSerivce = /** @class */ (function () {
    function InstructorAuthSerivce(instructorAuthRepository, otpRepository) {
        this.instructorAuthRepository = instructorAuthRepository;
        this.otpRepository = otpRepository;
    }
    InstructorAuthSerivce.prototype.registerInstructor = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, otp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instructorAuthRepository.findByEmail(email)];
                    case 1:
                        existing = _a.sent();
                        if (existing) {
                            throw new Error("Instructor already exists");
                        }
                        otp = (0, otpGenerator_1.default)();
                        return [4 /*yield*/, this.otpRepository.saveOTP({
                                email: email,
                                otp: otp,
                                expiresAt: otpGenerator_1.otpExpiry
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, sendMail_1.sendMail)(email, otp)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InstructorAuthSerivce.prototype.verifyOtp = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var otpRecord, hashedPassword, instructor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.otpRepository.findOtpbyEmail(data.email)];
                    case 1:
                        otpRecord = _a.sent();
                        console.log(data.otp);
                        console.log(otpRecord === null || otpRecord === void 0 ? void 0 : otpRecord.otp);
                        if (!otpRecord)
                            throw new Error("OTP not found");
                        if (otpRecord.otp !== data.otp) {
                            throw new Error("Invalid OTP");
                        }
                        return [4 /*yield*/, bcrypt_1.default.hash(data.password, 10)];
                    case 2:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, this.instructorAuthRepository.createInstructor(__assign(__assign({}, data), { password: hashedPassword }))];
                    case 3:
                        instructor = _a.sent();
                        return [4 /*yield*/, this.otpRepository.deleteOtpbyEmail(data.email)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, instructor];
                }
            });
        });
    };
    InstructorAuthSerivce.prototype.loginInstructor = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var instructor, isMatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instructorAuthRepository.findByEmail(email)];
                    case 1:
                        instructor = _a.sent();
                        if (!instructor) {
                            throw new Error("Instructor not registered");
                        }
                        return [4 /*yield*/, bcrypt_1.default.compare(password, instructor.password)];
                    case 2:
                        isMatch = _a.sent();
                        if (!isMatch) {
                            throw new Error("Passowrd doesn't match");
                        }
                        return [2 /*return*/, { instructor: instructor }];
                }
            });
        });
    };
    InstructorAuthSerivce.prototype.handleForgotPassword = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var instructor, otp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instructorAuthRepository.findByEmail(email)];
                    case 1:
                        instructor = _a.sent();
                        if (!instructor) {
                            throw new Error("No Instructor found");
                        }
                        otp = (0, otpGenerator_1.default)();
                        return [4 /*yield*/, this.otpRepository.saveOTP({
                                email: email,
                                otp: otp,
                                expiresAt: otpGenerator_1.otpExpiry
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, sendMail_1.sendMail)(email, otp)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InstructorAuthSerivce.prototype.verifyForgotOtp = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var otpRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.otpRepository.findOtpbyEmail(data.email)];
                    case 1:
                        otpRecord = _a.sent();
                        if (!otpRecord) {
                            throw new Error("Couldn't find otp in email");
                        }
                        if (otpRecord.otp !== data.otp) {
                            throw new Error("otp doesn't match");
                        }
                        return [4 /*yield*/, this.otpRepository.deleteOtpbyEmail(data.email)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    InstructorAuthSerivce.prototype.handleResetPassword = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var instructor, hashedPassword;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.instructorAuthRepository.findByEmail(data.email)];
                    case 1:
                        instructor = _a.sent();
                        if (!instructor) {
                            throw new Error("User not found");
                        }
                        if (data.newPassword !== data.confirmPassword) {
                            throw new Error("Password didn't match");
                        }
                        return [4 /*yield*/, bcrypt_1.default.hash(data.newPassword, 10)];
                    case 2:
                        hashedPassword = _a.sent();
                        instructor.password = hashedPassword;
                        return [4 /*yield*/, instructor.save()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    InstructorAuthSerivce.prototype.handleResendOtp = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var instructor, otp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.otpRepository.findOtpbyEmail(email)];
                    case 1:
                        instructor = _a.sent();
                        if (!instructor) {
                            throw new Error("NO user found");
                        }
                        otp = (0, otpGenerator_1.default)();
                        return [4 /*yield*/, this.otpRepository.saveOTP({
                                email: email,
                                otp: otp,
                                expiresAt: otpGenerator_1.otpExpiry
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, sendMail_1.sendMail)(email, otp)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return InstructorAuthSerivce;
}());
exports.InstructorAuthSerivce = InstructorAuthSerivce;
