import express, { Router } from "express";
import customer from "../controllers/customer";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, customer.getCustomers);
router.patch("/:id", verifyToken, customer.updateCustomer);

export default router;
