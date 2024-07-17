import express, { Router } from "express";
import customer_meters from "../controllers/customer_meters";
import payments from "../controllers/payments";
import verifyToken from "../utils/verifyToken";
import { meterValidator } from "../utils";

const router: Router = express.Router();

router.get("/", verifyToken, customer_meters.getCustomerMeters);
router.patch("/:id", verifyToken, customer_meters.updateCustomerMeter);
router.post("/stron", verifyToken, customer_meters.syncCustomerAccountToStron);
router.get(
  "/landlord/:id",
  verifyToken,
  customer_meters.getCustomerMetersPerLandlord
);
router.get(
  "/landlord/tenant/:id",
  verifyToken,
  customer_meters.getCustomerMetersPerTenant
);
router.post(
  "/manual/payment",
  verifyToken,
  meterValidator.manualPayment,
  payments.manualPayment
);

export default router;
