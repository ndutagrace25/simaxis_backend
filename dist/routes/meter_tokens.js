"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meter_tokens_1 = __importDefault(require("../controllers/meter_tokens"));
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const router = express_1.default.Router();
router.get("/", verifyToken_1.default, meter_tokens_1.default.getMeterTokens);
router.post("/send-tokens-manually", verifyToken_1.default, meter_tokens_1.default.sendTokensManually);
exports.default = router;
