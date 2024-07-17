import { body, ValidationChain } from "express-validator";

export const saveMeter: ValidationChain[] = [
  body("meter_type_id")
    .exists()
    .withMessage("Meter type is required")
    .isString()
    .withMessage("Meter type is required")
    .trim(),
  body("serial_number")
    .exists()
    .withMessage("Meter number is required")
    .isInt()
    .withMessage("Meter number should be of type number")
    .isLength({ min: 11, max: 11 })
    .withMessage("Invalid meter number, meter number has 11 digits")
    .trim(),
  body("county_number")
    .exists()
    .withMessage("County is required")
    .isInt()
    .withMessage("County number is required")
    .trim(),
];

export const manualPayment: ValidationChain[] = [
  body("meter_id")
    .exists()
    .withMessage("Meter is required")
    .isString()
    .withMessage("Meter is required")
    .trim(),
  body("phone_number")
    .exists()
    .withMessage("Phone number is required")
    .isString()
    .withMessage("Phone number is required")
    .isLength({ min: 9, max: 13 })
    .withMessage("Phone number is invalid")
    .trim(),
  body("amount")
    .exists()
    .withMessage("Amount is required")
    .isInt()
    .withMessage("Amount is type number is required")
    .trim(),
  body("payment_code")
    .exists()
    .withMessage("MPESA code is required")
    .isString()
    .withMessage("MPESA code is required")
    .trim(),
];
