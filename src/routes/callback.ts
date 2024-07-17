import express, { Router } from "express";
import payments from "../controllers/payments";

const router: Router = express.Router();

router.post("/", payments.paymentCallback);
router.post("/validate", payments.mpesaConfirmation);
router.post("/confirm", payments.mpesaValidation);
router.post("/timeout-url", payments.timeoutUrl);

export default router;
