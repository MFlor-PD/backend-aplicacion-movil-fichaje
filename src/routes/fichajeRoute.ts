import { Router } from "express";
import { registrarEntrada, registrarSalida, registrarExtra, historialFichajes, fichajeEnCurso } from '../controllers/fichajeController.js'
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/entrada", authMiddleware, registrarEntrada);
router.put("/salida/:fichajeId", authMiddleware, registrarSalida);
router.put("/extra/:fichajeId", authMiddleware, registrarExtra);
router.get("/historial", authMiddleware, historialFichajes); // 👈 ya no necesita :userId
router.get("/actual", authMiddleware, fichajeEnCurso);


export default router;
