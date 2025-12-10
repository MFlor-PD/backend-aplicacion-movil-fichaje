//src/app.ts
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoute.js";
import fichajeRoutes from "./routes/fichajeRoute.js";
import recoveryRoutes from "./routes/recoveyPasswordRoute.js"

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API de control de horas funcionando 🚀" });
});
app.use("/api/users", userRoutes);
app.use("/api/fichajes", fichajeRoutes);
app.use("/api/recovery", recoveryRoutes);


export default app;

//npm run dev
