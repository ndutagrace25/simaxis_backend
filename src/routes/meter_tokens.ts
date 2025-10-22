import express, { Router } from "express";
import meter_tokens from "../controllers/meter_tokens";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, meter_tokens.getMeterTokens);
router.post(
  "/send-tokens-manually",
  verifyToken,
  meter_tokens.sendTokensManually
);

export default router;
