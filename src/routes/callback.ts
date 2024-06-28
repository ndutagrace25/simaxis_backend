import express, { Router } from "express";
import payments from "../controllers/payments";

const router: Router = express.Router();

router.post("/", payments.paymentCallback);
router.post("/validate", payments.mpesaValidation);
router.post("/confirm", payments.mpesaConfirmation);

export default router;
