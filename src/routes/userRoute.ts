import { Router } from "express";
import { createUser, updateProfile, getUser } from '../controllers/userController.js'
const router = Router();

router.post("/register", createUser);
router.put("/me/:id", updateProfile);
router.get("/me/:id", getUser);

export default router;