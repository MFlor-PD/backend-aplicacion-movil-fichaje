import { Router } from "express";
import { registrarEntrada, registrarSalida, registrarExtra, historialFichajes } from '../controllers/fichajeController.js'
const router = Router();

router.post("/entrada", registrarEntrada);
router.put("/salida/:fichajeId", registrarSalida);
router.put("/extra/:fichajeId", registrarExtra);
router.get("/historial/:userId", historialFichajes);

export default router;