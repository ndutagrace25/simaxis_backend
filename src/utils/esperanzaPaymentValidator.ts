import { body, ValidationChain } from "express-validator";

export const saveEsperanzaPayment: ValidationChain[] = [
  body("payment_date")
    .exists()
    .withMessage("Payment date is required")
    .isISO8601()
    .withMessage("Payment date is invalid"),
  body("amount")
    .exists()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a number greater than 0"),
  body("payment_mode")
    .exists()
    .withMessage("Payment mode is required")
    .isString()
    .withMessage("Payment mode is required")
    .trim()
    .notEmpty()
    .withMessage("Payment mode is required"),
  body("reference")
    .optional({ nullable: true })
    .isString()
    .withMessage("Reference must be text")
    .trim(),
];
