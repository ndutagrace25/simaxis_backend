import { body, ValidationChain } from "express-validator";

export const registerUser: ValidationChain[] = [
  body("first_name")
    .exists()
    .withMessage("First name is required")
    .isString()
    .trim(),
  body("last_name")
    .exists()
    .withMessage("Last name is required")
    .isString()
    .trim(),
  body("phone")
    .exists()
    .withMessage("Last name is required")
    .isString()
    .trim(),
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .trim(),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .trim(),
];

export const loginUser: ValidationChain[] = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .trim(),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isString()
    .trim(),
];

export const requestPasswordChange: ValidationChain[] = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .trim(),
];

export const resetPassword: ValidationChain[] = [
  body("password")
    .exists()
    .withMessage("Password is required")
    .isString()
    .trim(),
  body("verification_code")
    .exists()
    .withMessage("Verification code is required")
    .isString()
    .trim(),
];
