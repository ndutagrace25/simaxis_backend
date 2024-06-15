import express, { Router } from "express";
import customer from "../controllers/customer";

const router: Router = express.Router();

router.get("/", customer.getLandlords);

export default router;
