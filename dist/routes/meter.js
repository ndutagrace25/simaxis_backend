"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meter_1 = __importDefault(require("../controllers/meter"));
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.get("/", verifyToken_1.default, meter_1.default.getAllMeters);
router.post("/", verifyToken_1.default, utils_1.meterValidator.saveMeter, meter_1.default.createMeter);
router.post("/stron", verifyToken_1.default, meter_1.default.syncMeterToStron);
router.get("/synced/customer", verifyToken_1.default, meter_1.default.getSyncedAndAttachedMeters);
router.post("/clear/tamper", verifyToken_1.default, meter_1.default.clearMeterTamper);
router.post("/clear/credit", verifyToken_1.default, meter_1.default.clearMeterCredit);
exports.default = router;
