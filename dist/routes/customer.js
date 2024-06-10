"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_1 = __importDefault(require("../controllers/customer"));
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const router = express_1.default.Router();
router.get("/", verifyToken_1.default, customer_1.default.getCustomers);
router.patch("/:id", verifyToken_1.default, customer_1.default.updateCustomer);
router.post("/stron", verifyToken_1.default, customer_1.default.syncCustomerToStron);
exports.default = router;
