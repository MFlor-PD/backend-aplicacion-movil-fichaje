// src/controllers/recoveryPasswordController.ts
import { Request, Response } from "express";
import { User } from "../models/user.js";
import { RecoveryCode } from "../models/recoveryCode.js";
import { sendEmail } from "../sendEmail.js"

// Enviar código de recuperación
export const requestPasswordRecovery = async (req: Request, res: Response) => {
  try {
    const { email, destino } = req.body;
    if (!email || !destino)
      return res.status(400).json({ error: "Email y destino son requeridos" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Limitar a 1 código al día
   const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await RecoveryCode.findOne({
      userId: user._id,
      createdAt: { $gte: today },
    });

    if (existing)
      return res
        .status(429)
        .json({ error: "Ya se solicitó un código hoy. Intenta mañana." });

    // Limpiar códigos antiguos
    await RecoveryCode.deleteMany({
      userId: user._id,
      expires: { $lt: new Date() },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    await RecoveryCode.create({ userId: user._id, code, expires });

    // Enviar correo usando la función centralizada
    await sendEmail({
      to: destino,
      subject: "Código de recuperación de contraseña",
      text: `Hola ${user.nombre}, tu código de recuperación es: ${code} (válido 5 minutos).`,
    });

    res.json({ message: "Código de recuperación enviado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error enviando código de recuperación" });
  }
};

// Resetear contraseña usando código
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ error: "Todos los campos son requeridos" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const recovery = await RecoveryCode.findOne({
      userId: user._id,
      code,
      used: false,
    });
    if (!recovery) return res.status(400).json({ error: "Código inválido" });
    if (recovery.expires < new Date())
      return res.status(400).json({ error: "Código expirado" });

    // Actualizar contraseña (hash automático por pre-save)
    user.password = newPassword;
    await user.save();

    // Marcar código como usado
    recovery.used = true;
    await recovery.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando contraseña" });
  }
};