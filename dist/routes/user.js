"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../controllers/user"));
const utils_1 = require("../utils");
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const router = express_1.default.Router();
router.get("/", verifyToken_1.default, user_1.default.getUsers);
router.post("/register", utils_1.authValidator.registerUser, user_1.default.registerUser);
router.post("/login", utils_1.authValidator.loginUser, user_1.default.loginUser);
exports.default = router;
