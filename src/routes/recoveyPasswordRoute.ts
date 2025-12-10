//src/routes/recoveyPasswordRoute.ts
import { Router } from "express";
import {
  requestPasswordRecovery,
  resetPassword,
} from "../controllers/recoveryPasswordController.js";

const router = Router();

router.post("/recover", requestPasswordRecovery); // Enviar código
router.post("/reset", resetPassword);            // Cambiar contraseña

export default router;
