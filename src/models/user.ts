import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  foto?: string;
  valorHora: number;
  compararPassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    foto: { type: String },
    valorHora: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar password en login
UserSchema.methods.compararPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
