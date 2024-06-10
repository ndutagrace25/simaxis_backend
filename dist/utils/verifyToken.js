"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// FORMAT OF TOKEN
// Authorization: Bearer <access_token>
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }
    const jwt_secret = process.env.JWT_SECRET;
    jsonwebtoken_1.default.verify(token, jwt_secret, (err, user) => {
        if (err) {
            return res.sendStatus(401); // Unauthorized
        }
        req.user = user;
        req.token = token;
        next();
    });
};
exports.default = verifyToken;
