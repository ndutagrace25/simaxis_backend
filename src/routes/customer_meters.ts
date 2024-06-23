import express, { Router } from "express";
import customer_meters from "../controllers/customer_meters";
import verifyToken from "../utils/verifyToken";

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

export default router;
