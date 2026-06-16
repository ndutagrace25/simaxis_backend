"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordChange = exports.loginUser = exports.registerUser = void 0;
const express_validator_1 = require("express-validator");
exports.registerUser = [
    (0, express_validator_1.body)("first_name")
        .exists()
        .withMessage("First name is required")
        .isString()
        .trim(),
    (0, express_validator_1.body)("last_name")
        .exists()
        .withMessage("Last name is required")
        .isString()
        .trim(),
    (0, express_validator_1.body)("phone").exists().withMessage("Last name is required").isString().trim(),
    (0, express_validator_1.body)("username")
        .exists()
        .withMessage("Username is required")
        .isString()
        .trim(),
    (0, express_validator_1.body)("national_id").exists().withMessage("ID is required").isNumeric().trim(),
    (0, express_validator_1.body)("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .trim(),
    (0, express_validator_1.body)("password")
        .exists()
        .withMessage("Password is required")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .trim(),
];
exports.loginUser = [
    (0, express_validator_1.body)("phone")
        .exists()
        .withMessage("Phone number is required")
        .isString()
        .withMessage("Invalid phone")
        .trim(),
    (0, express_validator_1.body)("password")
        .exists()
        .withMessage("Password is required")
        .isString()
        .trim(),
];
exports.requestPasswordChange = [
    (0, express_validator_1.body)("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .trim(),
];
exports.resetPassword = [
    (0, express_validator_1.body)("password")
        .exists()
        .withMessage("Password is required")
        .isString()
        .trim(),
    (0, express_validator_1.body)("verification_code")
        .exists()
        .withMessage("Verification code is required")
        .isString()
        .trim(),
];
