"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const counties_1 = __importDefault(require("../controllers/counties"));
const router = express_1.default.Router();
router.get("/", counties_1.default.getCounties);
exports.default = router;
