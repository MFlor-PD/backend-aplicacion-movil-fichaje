import { Router } from "express";
import { loginUser, createUser, updateProfile, getUser } from '../controllers/userController.js'
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/me/:id", authMiddleware, updateProfile);
router.get("/me/:id", authMiddleware, getUser);

export default router;