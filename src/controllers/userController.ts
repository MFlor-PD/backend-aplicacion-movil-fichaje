import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Fichaje } from "../models/fichaje.js";
import { AuthRequest } from "../middleware/authMiddleware.js"; // tu middleware de auth

// Crear usuario (registro)
const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, valorHora } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email ya registrado" });

    const user = new User({ nombre, email, password, valorHora });
    await user.save(); // middleware pre("save") hace hash automáticamente

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "30d" });

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
    const message = err instanceof Error ? err.message : "Error al crear usuario";
    res.status(500).json({ error: message });
  }
};

// Iniciar sesión
const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "30d" });

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
    const message = err instanceof Error ? err.message : "Error al iniciar sesión";
    res.status(500).json({ error: message });
  }
};

// Actualizar perfil
const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, foto, valorHora, password, email } = req.body;
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    let emailChanged = false;

    // Actualizar nombre
    if (nombre) user.nombre = nombre;

    // Actualizar foto (acepta vacío)
    if (foto !== undefined) user.foto = foto;
    

    // Actualizar valor hora
    if (valorHora !== undefined) user.valorHora = valorHora;

    // Actualizar password
    if (password) user.password = password;

    // Actualizar email y marcar cambio
    if (email && email !== user.email) {
      user.email = email;
      emailChanged = true;
    }

    await user.save(); // dispara middleware pre("save") para hash si cambió password

    // Generar token solo si cambió la contraseña
    let token;
    if (password) {
      token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" }
      );
    }

    res.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        valorHora: user.valorHora,
        foto: user.foto,
      },
      token: token || undefined,
      passwordChanged: Boolean(password),
      emailChanged: emailChanged,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al actualizar perfil";
    res.status(500).json({ error: message });
  }
};


// Obtener datos de un usuario específico
const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al obtener usuario";
    res.status(500).json({ error: message });
  }
};

// 🔹 NUEVO: Eliminar usuario y todo su historial
const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1️⃣ Eliminar todos los fichajes del usuario
    await Fichaje.deleteMany({ usuario: userId });

    // 2️⃣ Eliminar usuario
    await User.findByIdAndDelete(userId);

    res.json({ message: "Usuario y todo su historial eliminado correctamente" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error eliminando usuario";
    res.status(500).json({ error: message });
  }
};

export { createUser, loginUser, updateProfile, getUser, deleteUser };
