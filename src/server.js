import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger.js";
import authRoutes from "./api/auth/authRoutes.js";
import usuariosRoutes from "./api/usuarios/usuariosRoutes.js";
import medicamentosRoutes from "./api/medicamentos/medicamentosRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da aplicação
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/medicamentos", medicamentosRoutes);

// Middleware de erro deve vir por último
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  console.log(`Swagger em http://localhost:${PORT}/docs`);
});
