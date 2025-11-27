import { Response } from "express";
import { Fichaje } from "../models/fichaje.js";
import { AuthRequest } from "../middleware/authMiddleware.js"; // tu middleware

// Registrar entrada
const registrarEntrada = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id; // viene del token
    const now = new Date();
    const inicio = now.toTimeString().slice(0, 5); // "HH:MM"

    const fichaje = new Fichaje({
      usuario: userId,
      fecha: now,
      inicio,
      duracionHoras: 0,
      importeDia: 0,
    });

    await fichaje.save();
    res.status(201).json({ message: "Entrada registrada", fichaje });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

// Registrar salida
const registrarSalida = async (req: AuthRequest, res: Response) => {
  try {
    const { fichajeId } = req.params;

    const fichaje = await Fichaje.findById(fichajeId).populate("usuario");
    if (!fichaje) return res.status(404).json({ error: "Fichaje no encontrado" });

    const now = new Date();
    const fin = now.toTimeString().slice(0, 5);

    const inicioParts = fichaje.inicio.split(":").map(Number);
    const inicioDate = new Date(fichaje.fecha);
    inicioDate.setHours(inicioParts[0], inicioParts[1], 0, 0);

    let duracionHoras = (now.getTime() - inicioDate.getTime()) / 1000 / 3600;
    if (duracionHoras < 0) duracionHoras += 24; // por si cruza medianoche

    const valorHora = (fichaje.usuario as any).valorHora || 0;
    const importeDia = duracionHoras * valorHora;

    fichaje.fin = fin;
    fichaje.duracionHoras = Number(duracionHoras.toFixed(2));
    fichaje.importeDia = Number(importeDia.toFixed(2));

    await fichaje.save();

    res.json({ message: "Salida registrada", fichaje });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

// Registrar extra
const registrarExtra = async (req: AuthRequest, res: Response) => {
  try {
    const { fichajeId } = req.params;

    const updated = await Fichaje.findByIdAndUpdate(
      fichajeId,
      { extra: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Fichaje no encontrado" });

    res.json({ message: "Fichaje marcado como extra", fichaje: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

// Saber si el usuario tiene un fichaje en curso
const fichajeEnCurso = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const abierto = await Fichaje.findOne({
      usuario: userId,
      fin: { $exists: false }
    }).sort({ fecha: -1 });

    res.json({ abierto });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo fichaje en curso" });
  }
};


// Historial de fichajes
const historialFichajes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id; // viene del token
    const fichajes = await Fichaje.find({ usuario: userId }).sort({ fecha: -1 });

    let totalMes = 0;
    let totalSemana = 0;

    const historial = fichajes.map(f => {
      let duracionHoras = 0;
      let importeDia = 0;

      if (f.inicio && f.fin) {
        const inicioParts = f.inicio.split(":").map(Number);
        const finParts = f.fin.split(":").map(Number);
        const inicioDate = new Date(f.fecha);
        inicioDate.setHours(inicioParts[0], inicioParts[1], 0, 0);
        const finDate = new Date(f.fecha);
        finDate.setHours(finParts[0], finParts[1], 0, 0);

        duracionHoras = (finDate.getTime() - inicioDate.getTime()) / 1000 / 3600;
        if (duracionHoras < 0) duracionHoras += 24;
        importeDia = duracionHoras * ((req.user as any).valorHora || 0);
      }

      totalMes += importeDia;

      // Total semana (domingo-sábado)
      const hoy = new Date();
      const semanaInicio = new Date(hoy);
      semanaInicio.setDate(hoy.getDate() - hoy.getDay());
      const semanaFin = new Date(semanaInicio);
      semanaFin.setDate(semanaInicio.getDate() + 6);

      if (new Date(f.fecha) >= semanaInicio && new Date(f.fecha) <= semanaFin) {
        totalSemana += importeDia;
      }

      return {
        ...f.toObject(),
        duracionHoras: Number(duracionHoras.toFixed(2)),
        importeDia: Number(importeDia.toFixed(2)),
      };
    });

    res.json({
      historial,
      totales: {
        semana: Number(totalSemana.toFixed(2)),
        mes: Number(totalMes.toFixed(2)),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

export { registrarEntrada, registrarSalida, registrarExtra, historialFichajes, fichajeEnCurso };
