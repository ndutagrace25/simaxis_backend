"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenant_1 = __importDefault(require("../controllers/tenant"));
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const router = express_1.default.Router();
router.get("/", verifyToken_1.default, tenant_1.default.getTenants);
exports.default = router;
