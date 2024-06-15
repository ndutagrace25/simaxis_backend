import express, { Router } from "express";
import meters from "../controllers/meter";
import verifyToken from "../utils/verifyToken";
import { meterValidator } from "../utils";

const router: Router = express.Router();

router.get("/", verifyToken, meters.getAllMeters);
router.post("/", verifyToken, meterValidator.saveMeter,  meters.createMeter);

export default router;
