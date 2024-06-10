import express, { Router } from "express";
import user from "../controllers/user";
import { authValidator } from "../utils";
import verifyToken from "../utils/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, user.getUsers);
router.post("/register", authValidator.registerUser, user.registerUser);
router.post("/login", authValidator.loginUser, user.loginUser);

export default router;
