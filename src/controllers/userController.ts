import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// Crear usuario (registro)
const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, valorHora } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email ya registrado" });

    const user = new User({ nombre, email, password, valorHora });
    await user.save(); // middleware pre("save") hace hash automáticamente

    // Generar token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });

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
     console.log("REQ.BODY:", req.body);
    const { email, password } = req.body;
    console.log("Email:", email, "Password:", password);
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
      { expiresIn: "30d" }
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
    const { nombre, foto, valorHora, password } = req.body;

    // Buscar al usuario
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Actualizar datos generales
    if (nombre) user.nombre = nombre;
    if (foto) user.foto = foto;
    if (valorHora !== undefined) user.valorHora = valorHora;

    // Actualizar password si viene
    if (password) user.password = password; // middleware pre("save") hará hash y actualizará passwordChangedAt

    await user.save(); // ⚡ dispara middleware pre("save")

    // Generar token nuevo solo si cambió contraseña
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
    });
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
