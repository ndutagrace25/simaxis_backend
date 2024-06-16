import express, { Router } from "express";
import tenants from "../controllers/tenant";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, tenants.getTenants);

export default router;
