"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payments_1 = __importDefault(require("../controllers/payments"));
const router = express_1.default.Router();
router.post("/", payments_1.default.paymentCallback);
router.post("/validate", payments_1.default.mpesaConfirmation);
router.post("/confirm", payments_1.default.mpesaValidation);
router.post("/timeout-url", payments_1.default.timeoutUrl);
exports.default = router;
