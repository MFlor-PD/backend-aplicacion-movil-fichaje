import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db.js"; // 👈 importa tu función de conexión

dotenv.config(); // 👈 carga variables del .env

const PORT = process.env.PORT || 4000;

// Conectamos a Mongo antes de levantar el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
});
