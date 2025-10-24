import { Request, Response } from "express";
import { User } from "../models/user.js";

// Crear usuario
const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, valorHora }: { nombre: string; email: string; password: string; valorHora: number } = req.body;
    const user = new User({ nombre, email, password, valorHora });
    await user.save();
    res.status(201).json({ message: "Usuario creado", userId: user._id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    res.status(400).json({ error: message });
  }
};

// Actualizar perfil
const updateProfile = async (req: Request, res: Response) => {
  const { nombre, foto, valorHora } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, foto, valorHora },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
  }
};

// Obtener datos de un usuario específico
const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
  }
};

export { createUser, updateProfile, getUser };
