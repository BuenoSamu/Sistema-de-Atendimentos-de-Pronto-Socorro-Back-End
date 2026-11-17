import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import pacientesRoutes from "./api/pacientes/pacientesRoutes.js";
import atendimentosRoutes from "./api/atendimentos/atendimentosRoutes.js";
import triagensRoutes from "./api/triagens/triagensRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import consultasRoutes from "./api/consultas/consultasRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/consultas", consultasRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/atendimentos", atendimentosRoutes);
app.use("/api/triagens", triagensRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => res.status(404).json({ mensagem: "Rota não encontrada." }));
app.use(errorHandler);
export default app;
