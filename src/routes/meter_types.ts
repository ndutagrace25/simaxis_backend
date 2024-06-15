import express, { Router } from "express";
import meter_types from "../controllers/meter_types";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, meter_types.getMeterTypes);

export default router;
