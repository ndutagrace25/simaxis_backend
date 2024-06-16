import express, { Router } from "express";
import customer_meters from "../controllers/customer_meters";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, customer_meters.getCustomerMeters);

export default router;
