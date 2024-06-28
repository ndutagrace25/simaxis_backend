import express, { Router } from "express";
import meter_tokens from "../controllers/meter_tokens";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, meter_tokens.getMeterTokens);

export default router;
