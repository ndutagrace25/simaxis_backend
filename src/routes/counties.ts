import express, { Router } from "express";
import counties from "../controllers/counties";

const router: Router = express.Router();

router.get("/", counties.getCounties);

export default router;
