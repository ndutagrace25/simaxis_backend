import express, { Router } from "express";
import user from "../controllers/user";

const router: Router = express.Router();

router.get("/", user.getUsers);
router.post("/", user.saveUser);

export default router;
