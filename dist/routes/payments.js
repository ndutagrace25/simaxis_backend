"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payments_1 = __importDefault(require("../controllers/payments"));
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const router = express_1.default.Router();
router.get("/", verifyToken_1.default, payments_1.default.getAllPayments);
router.get("/revenue", verifyToken_1.default, payments_1.default.getRevenueData);
exports.default = router;
