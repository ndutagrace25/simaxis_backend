"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_meters_1 = __importDefault(require("../controllers/customer_meters"));
const payments_1 = __importDefault(require("../controllers/payments"));
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.get("/", verifyToken_1.default, customer_meters_1.default.getCustomerMeters);
router.patch("/:id", verifyToken_1.default, customer_meters_1.default.updateCustomerMeter);
router.post("/stron", verifyToken_1.default, customer_meters_1.default.syncCustomerAccountToStron);
router.get("/landlord/:id", verifyToken_1.default, customer_meters_1.default.getCustomerMetersPerLandlord);
router.get("/landlord/tenant/:id", verifyToken_1.default, customer_meters_1.default.getCustomerMetersPerTenant);
router.post("/manual/payment", verifyToken_1.default, utils_1.meterValidator.manualPayment, payments_1.default.manualPayment);
exports.default = router;
