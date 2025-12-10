import { Response } from "express";
import { Fichaje } from "../models/fichaje.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// Registrar entrada
const registrarEntrada = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date(); // UTC
    const fichaje = new Fichaje({
      usuario: userId,
      fecha: now, // guardamos UTC
      duracionHoras: 0,
      importeDia: 0,
      extra: false,
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
    const duracionHoras = (now.getTime() - fichaje.fecha.getTime()) / 1000 / 3600;
    const valorHora = (fichaje.usuario as any).valorHora || 0;
    const importeDia = duracionHoras * valorHora;

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
    const { extra } = req.body;

    const updated = await Fichaje.findByIdAndUpdate(
      fichajeId,
      { extra: !!extra },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Fichaje no encontrado" });

    res.json({ message: "Fichaje marcado como extra", fichaje: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

// Fichaje en curso
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
    const userId = req.user!.id;
    const fichajes = await Fichaje.find({ usuario: userId }).sort({ fecha: -1 });

    let totalMes = 0;
    let totalSemana = 0;

    const historial = fichajes.map(f => {
      const duracionHoras = f.duracionHoras || 0;
      const importeDia = f.importeDia || 0;

      totalMes += importeDia;

      const hoy = new Date();
      const semanaInicio = new Date(hoy);
      semanaInicio.setDate(hoy.getDate() - hoy.getDay());
      const semanaFin = new Date(semanaInicio);
      semanaFin.setDate(semanaInicio.getDate() + 6);

      if (f.fecha >= semanaInicio && f.fecha <= semanaFin) totalSemana += importeDia;

      return {
        ...f.toObject(),
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

// Eliminar un fichaje
const eliminarFichaje = async (req: AuthRequest, res: Response) => {
  try {
    const { fichajeId } = req.params;
    const userId = req.user!.id;
    const fichaje = await Fichaje.findOne({ _id: fichajeId, usuario: userId });
    if (!fichaje) return res.status(404).json({ error: "Fichaje no encontrado" });

    await fichaje.deleteOne();
    res.json({ message: "Fichaje eliminado correctamente" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

// Eliminar todo el historial
const eliminarHistorial = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await Fichaje.deleteMany({ usuario: userId });
    res.json({ message: "Historial completo eliminado correctamente" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

export { registrarEntrada, registrarSalida, registrarExtra, historialFichajes, fichajeEnCurso, eliminarFichaje, eliminarHistorial };
