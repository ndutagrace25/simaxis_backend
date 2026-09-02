import express, { Router } from "express";
import website_token_checks from "../controllers/website_token_checks";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, website_token_checks.getWebsiteTokenCheckSummary);

export default router;
