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
exports.AdminController = void 0;
var statusCodes_1 = require("../../constants/statusCodes");
var AdminController = /** @class */ (function () {
    function AdminController(adminService) {
        this.adminService = adminService;
    }
    AdminController.prototype.getAllUsers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var users, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.adminService.getAllUsers()];
                    case 1:
                        users = _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json(users);
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
    AdminController.prototype.getAllTutors = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tutors, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.adminService.getAllTutors()];
                    case 1:
                        tutors = _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json(tutors);
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AdminController.prototype.approveTutor = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, approve, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = req.body.email;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.adminService.verifyTutor(email)];
                    case 2:
                        approve = _a.sent();
                        res.status(statusCodes_1.httpStatus.OK).json("Tutor Approved Successfully");
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdminController.prototype.rejectTutor = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, deleted, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = req.params.email;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.adminService.rejectTutor(email)];
                    case 2:
                        deleted = _a.sent();
                        if (!deleted) {
                            res.status(statusCodes_1.httpStatus.NOT_FOUND).json({ message: "Tutor Not Found" });
                        }
                        res.status(statusCodes_1.httpStatus.OK).json({ message: "Tutor rejected and deleted successfully" });
                        return [3 /*break*/, 4];
                    case 3:
                        err_4 = _a.sent();
                        res.status(statusCodes_1.httpStatus.INTERNAL_SERVER_ERROR).json(err_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AdminController;
}());
exports.AdminController = AdminController;
