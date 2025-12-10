import mongoose, { Schema, Document } from "mongoose"; 
import { IUser } from "./user.js";

export interface IFichaje extends Document {
  usuario: IUser["_id"];
  fecha: Date;
  inicio: Date; // "HH:MM"
  fin?: Date;   // "HH:MM"
  extra?: boolean;
  duracionHoras?: number; // duración en horas
  importeDia?: number;   // duracionHoras * valorHora
}

const FichajeSchema: Schema<IFichaje> = new Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fecha: { type: Date, required: true },
    inicio: { type: Date, required: true },
    fin: { type: Date },
    extra: { type: Boolean, default: false },
    duracionHoras: { type: Number, default: 0 },
    importeDia: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Fichaje = mongoose.model<IFichaje>("Fichaje", FichajeSchema);
