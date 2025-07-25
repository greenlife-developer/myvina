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
var bcrypt = require("bcrypt");
var axios = require("axios");
var fs = require("fs");
var moment = require("moment");
var User_1 = require("../model/User");
var jwt = require("jsonwebtoken");
var generateToken = function (id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
var createUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, name_1, email, password, role, permissions, salt, hash, existingUser, newUser, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Received request to create or update user:", req.body);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 9, , 10]);
                _a = req.body, id = _a.id, name_1 = _a.name, email = _a.email, password = _a.password, role = _a.role, permissions = _a.permissions;
                if (!name_1 || !role || !permissions) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ message: "Name, role, and permissions are required." })];
                }
                return [4 /*yield*/, bcrypt.genSalt(10)];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, bcrypt.hash(password, salt)];
            case 3:
                hash = _b.sent();
                if (!id) return [3 /*break*/, 6];
                return [4 /*yield*/, User_1.default.findById(id)];
            case 4:
                existingUser = _b.sent();
                if (!existingUser)
                    return [2 /*return*/, res.status(404).json({ message: "User not found." })];
                existingUser.name = name_1;
                existingUser.email = email;
                existingUser.role = role;
                existingUser.permissions = permissions;
                if (password) {
                    existingUser.password = hash;
                }
                return [4 /*yield*/, existingUser.save()];
            case 5:
                _b.sent();
                return [2 /*return*/, res
                        .status(200)
                        .json({ message: "User updated", user: existingUser })];
            case 6:
                newUser = new User_1.default({
                    name: name_1,
                    email: email,
                    password: hash,
                    role: role,
                    permissions: permissions,
                });
                return [4 /*yield*/, newUser.save()];
            case 7:
                _b.sent();
                return [2 /*return*/, res.status(201).json({ message: "User created", user: newUser })];
            case 8: return [3 /*break*/, 10];
            case 9:
                err_1 = _b.sent();
                console.error(err_1);
                return [2 /*return*/, res
                        .status(500)
                        .json({ message: "Something went wrong", error: err_1 })];
            case 10: return [2 /*return*/];
        }
    });
}); };
var loginUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, passwordMatch, token, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                console.log("Login attempt with email:", email);
                if (!email || !password) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ message: "Email and password are required." })];
                }
                return [4 /*yield*/, User_1.default.findOne({ email: email })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: "User not found." })];
                }
                return [4 /*yield*/, bcrypt.compare(password, user.password)];
            case 2:
                passwordMatch = _b.sent();
                if (!passwordMatch) {
                    return [2 /*return*/, res.status(401).json({ message: "Invalid password." })];
                }
                token = generateToken(user._id);
                console.log("Generated token for user:", user._id);
                res.cookie("token", token, {
                    path: "/",
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    expires: new Date(Date.now() + 86400 * 1000), // 1 day
                });
                // Here you would typically generate a JWT token and return it
                res.status(200).json({ message: "Login successful", user: user, status: 200 });
                return [3 /*break*/, 4];
            case 3:
                err_2 = _b.sent();
                console.error(err_2);
                return [2 /*return*/, res
                        .status(500)
                        .json({ message: "Something went wrong", error: err_2 })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var loginStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, verified;
    return __generator(this, function (_a) {
        token = req.cookies.token;
        console.log("Received token for login status check:", token);
        if (!token) {
            return [2 /*return*/, res.json(false)];
        }
        verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verification result:", verified);
        if (verified) {
            return [2 /*return*/, res.json(true)];
        }
        return [2 /*return*/, res.json(false)];
    });
}); };
var logoutUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            res.cookie("token", "", {
                path: "/",
                httpOnly: true,
                expires: new Date(0),
                secure: true,
            });
            return [2 /*return*/, res.status(200).json({ message: "Successfully Logged Out" })];
        }
        catch (err) {
            console.error(err);
            return [2 /*return*/, res
                    .status(500)
                    .json({ message: "Something went wrong", error: err })];
        }
        return [2 /*return*/];
    });
}); };
var getUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User_1.default.find({})];
            case 1:
                users = _a.sent();
                return [2 /*return*/, res.status(200).json(users)];
            case 2:
                err_3 = _a.sent();
                console.error(err_3);
                return [2 /*return*/, res
                        .status(500)
                        .json({ message: "Something went wrong", error: err_3 })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var updateUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name, email, password, role, permissions, user, err_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, name = _a.name, email = _a.email, password = _a.password, role = _a.role, permissions = _a.permissions;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, User_1.default.findById(id)];
            case 2:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: "User not found." })];
                }
                if (name)
                    user.name = name;
                if (email)
                    user.email = email;
                if (role)
                    user.role = role;
                if (permissions)
                    user.permissions = permissions;
                return [4 /*yield*/, user.save()];
            case 3:
                _b.sent();
                return [2 /*return*/, res.status(200).json({ message: "User updated", user: user })];
            case 4:
                err_4 = _b.sent();
                console.error(err_4);
                return [2 /*return*/, res
                        .status(500)
                        .json({ message: "Something went wrong", error: err_4 })];
            case 5: return [2 /*return*/];
        }
    });
}); };
var deleteUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                console.log("Received request to delete user:", id);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, User_1.default.findByIdAndDelete(id)];
            case 2:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: "User not found." })];
                }
                return [2 /*return*/, res
                        .status(200)
                        .json({ message: "User deleted successfully.", status: 200 })];
            case 3:
                err_5 = _a.sent();
                console.error(err_5);
                return [2 /*return*/, res
                        .status(500)
                        .json({ message: "Something went wrong", error: err_5 })];
            case 4: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    createUser: createUser,
    loginUser: loginUser,
    getUsers: getUsers,
    updateUser: updateUser,
    deleteUser: deleteUser,
    loginStatus: loginStatus,
    logoutUser: logoutUser,
};
