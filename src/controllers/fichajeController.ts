import { Request, Response } from "express";
import { Fichaje } from "../models/fichaje.js";
import { User } from "../models/user.js";

// Registrar entrada
const registrarEntrada = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
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
const registrarSalida = async (req: Request, res: Response) => {
  try {
    const { fichajeId } = req.params;

    const fichaje = await Fichaje.findById(fichajeId).populate("usuario");
    if (!fichaje) return res.status(404).json({ error: "Fichaje no encontrado" });

    const now = new Date();
    const fin = now.toTimeString().slice(0, 5);

    // Calcular duración en horas
    const inicioDate = new Date(fichaje.fecha);
    const [h, m] = fichaje.inicio.split(":").map(Number);
    inicioDate.setHours(h, m);

    const duracionHoras = (now.getTime() - inicioDate.getTime()) / 1000 / 3600; // horas como decimal

    // Calcular importe del día
    const valorHora = (fichaje.usuario as any).valorHora || 0; // valor/hora del usuario
    const importeDia = duracionHoras * valorHora;

    // Actualizar fichaje
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
const registrarExtra = async (req: Request, res: Response) => {
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

// Historial de fichajes
const historialFichajes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const fichajes = await Fichaje.find({ usuario: userId }).sort({ fecha: -1 });
    res.json(fichajes);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
};

export { registrarEntrada, registrarSalida, registrarExtra, historialFichajes };
