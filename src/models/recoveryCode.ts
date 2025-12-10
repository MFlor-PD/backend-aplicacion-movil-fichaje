//src/models/recoveryCode.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRecoveryCode extends Document {
  userId: string;
  code: string;
  expires: Date;
  createdAt: Date;
  used: boolean;
}

const RecoveryCodeSchema: Schema<IRecoveryCode> = new Schema(
  {
    userId: { type: String, required: true },
    code: { type: String, required: true },
    expires: { type: Date, required: true },
    used: { type: Boolean, default: false }, // marca si el código ya se usó
  },
  { timestamps: true }
);

export const RecoveryCode = mongoose.model<IRecoveryCode>(
  "RecoveryCode",
  RecoveryCodeSchema
);
