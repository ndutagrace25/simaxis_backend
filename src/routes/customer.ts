import express, { Router } from "express";
import customer from "../controllers/customer";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, customer.getCustomers);
router.patch("/:id", verifyToken, customer.updateCustomer);
router.post("/stron", verifyToken, customer.syncCustomerToStron);
router.post("/attach/meter", verifyToken, customer.attachMeterToCustomer);

export default router;
