import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, IUser } from "../models/user.js";

// Extendemos el tipo Request para incluir user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Middleware de autenticación
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verificamos y casteamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      id: string;
      email: string;
      iat: number; // fecha de emisión del token
    };

    // Buscamos al usuario en la base de datos
    const user: IUser | null = await User.findById(decoded.id);
if (!user) {
  return res.status(401).json({ message: "Usuario no encontrado" });
}

    // Si la contraseña se cambió después de generar el token, lo invalidamos
    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      return res.status(401).json({ message: "Token inválido: contraseña cambiada recientemente" });
    }

    // Guardamos datos del usuario en req.user
    req.user = { id: (user._id as any).toString(), // <--- forzamos el tipo a any
email: user.email 
};

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
