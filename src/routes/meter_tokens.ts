import express, { Router } from "express";
import meter_tokens from "../controllers/meter_tokens";
import verifyToken from "../utils/verifyToken";
import { publicTokenLookupLimiter } from "../utils/rateLimiter";

const router: Router = express.Router();

router.get("/", verifyToken, meter_tokens.getMeterTokens);
router.post(
  "/send-tokens-manually",
  verifyToken,
  meter_tokens.sendTokensManually
);
// Public: no verifyToken. Requires meter_number + payment_code (M-Pesa
// receipt code) as a second factor, and is rate-limited per IP.
router.get(
  "/public/last-token",
  publicTokenLookupLimiter,
  meter_tokens.getLastTokenForCustomer
);

export default router;
