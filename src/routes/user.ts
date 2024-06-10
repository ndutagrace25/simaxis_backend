import express, { Router } from "express";
import user from "../controllers/user";
import { authValidator } from "../utils";

const router: Router = express.Router();

router.get("/", user.getUsers);
router.post("/register", authValidator.registerUser, user.registerUser);

export default router;
