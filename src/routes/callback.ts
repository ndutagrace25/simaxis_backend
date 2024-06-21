import express, { Router } from "express";
import payments from "../controllers/payments";

const router: Router = express.Router();

router.post("/", payments.paymentCallback);

export default router;
