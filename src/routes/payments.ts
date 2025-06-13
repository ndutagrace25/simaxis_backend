import express, { Router } from "express";
import payments from "../controllers/payments";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, payments.getAllPayments);

router.get("/revenue", verifyToken, payments.getRevenueData);

export default router;
