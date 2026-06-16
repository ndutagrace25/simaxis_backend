"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualPayment = exports.saveMeter = void 0;
const express_validator_1 = require("express-validator");
exports.saveMeter = [
    (0, express_validator_1.body)("meter_type_id")
        .exists()
        .withMessage("Meter type is required")
        .isString()
        .withMessage("Meter type is required")
        .trim(),
    (0, express_validator_1.body)("serial_number")
        .exists()
        .withMessage("Meter number is required")
        .isInt()
        .withMessage("Meter number should be of type number")
        .isLength({ min: 11, max: 11 })
        .withMessage("Invalid meter number, meter number has 11 digits")
        .trim(),
    (0, express_validator_1.body)("county_number")
        .exists()
        .withMessage("County is required")
        .isInt()
        .withMessage("County number is required")
        .trim(),
];
exports.manualPayment = [
    (0, express_validator_1.body)("meter_id")
        .exists()
        .withMessage("Meter is required")
        .isString()
        .withMessage("Meter is required")
        .trim(),
    (0, express_validator_1.body)("phone_number")
        .exists()
        .withMessage("Phone number is required")
        .isString()
        .withMessage("Phone number is required")
        .isLength({ min: 9, max: 13 })
        .withMessage("Phone number is invalid")
        .trim(),
    (0, express_validator_1.body)("amount")
        .exists()
        .withMessage("Amount is required")
        .isInt()
        .withMessage("Amount is type number is required")
        .trim(),
    (0, express_validator_1.body)("payment_code")
        .exists()
        .withMessage("MPESA code is required")
        .isString()
        .withMessage("MPESA code is required")
        .trim(),
];
