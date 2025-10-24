import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.js";

export interface IFichaje extends Document {
  usuario: IUser["_id"];
  fecha: Date;
  inicio: string; // hora de inicio, ej. "08:30"
  fin?: string;   // hora de fin, opcional si aún no fichó salida
  extra?: boolean;
}

const FichajeSchema: Schema<IFichaje> = new Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fecha: { type: Date, required: true },
    inicio: { type: String, required: true },
    fin: { type: String },
    extra: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Fichaje = mongoose.model<IFichaje>("Fichaje", FichajeSchema);
