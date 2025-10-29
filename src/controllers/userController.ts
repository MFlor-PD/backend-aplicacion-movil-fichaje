import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// Crear usuario (registro)
const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, valorHora } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      nombre,
      email,
      password: hashedPassword,
      valorHora,
    });

    await user.save();

    // Crear token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuario creado correctamente",
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        valorHora: user.valorHora,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al crear usuario";
    res.status(400).json({ error: message });
  }
};

// Iniciar sesión
const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        valorHora: user.valorHora,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al iniciar sesión";
    res.status(500).json({ error: message });
  }
};

// Actualizar perfil
const updateProfile = async (req: Request, res: Response) => {
  try {
    const { nombre, foto, valorHora } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, foto, valorHora },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(updatedUser);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al actualizar perfil";
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
    const message =
      err instanceof Error ? err.message : "Error al obtener usuario";
    res.status(500).json({ error: message });
  }
};

export { createUser, loginUser, updateProfile, getUser };
