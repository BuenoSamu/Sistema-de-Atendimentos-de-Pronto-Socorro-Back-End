import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import medicamentosRoutes from "./api/medicamentos/medicamentosRoutes.js";
import pacientesRoutes from "./api/pacientes/pacientesRoutes.js";
import authRoutes from "./api/auth/authRoutes.js";
import usuariosRoutes from "./api/usuarios/usuariosRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/medicamentos", medicamentosRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);
export default app;
