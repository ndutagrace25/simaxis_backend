import express, { Router } from "express";
import meter_tokens from "../controllers/meter_tokens";
import verifyToken from "../utils/verifyToken";
import { publicTokenLookupLimiter } from "../utils/rateLimiter";

const router: Router = express.Router();

router.get("/", verifyToken, meter_tokens.getMeterTokens);
router.get(
  "/monthly-report",
  verifyToken,
  meter_tokens.getMonthlyTokenUsageReport
);
router.post(
  "/send-tokens-manually",
  verifyToken,
  meter_tokens.sendTokensManually
);
// Public: no verifyToken. Looks up by meter_number alone (11 digits),
// rate-limited per IP to slow down enumeration attempts.
router.get(
  "/public/last-token",
  publicTokenLookupLimiter,
  meter_tokens.getLatestTokensForCustomer
);

export default router;
