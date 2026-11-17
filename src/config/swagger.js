import { fileURLToPath } from "node:url";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VIHVA API",
      version: "1.0.0",
      description: "Documentação da API VIHVA",
    },
    servers: [
      {
        url: "/",
        description: "Local",
      },
    ],
  },

  apis: [fileURLToPath(new URL("../api/**/*Routes.js", import.meta.url)).replaceAll("\\", "/")],
};

export const swaggerSpec = swaggerJSDoc(options);

for (const operacoes of Object.values(swaggerSpec.paths)) {
  for (const [metodo, operacao] of Object.entries(operacoes)) {
    if (!['get', 'post', 'patch'].includes(metodo)) continue;
    operacao.responses['400'] ??= { description: 'Dados inválidos' };
    operacao.responses['500'] ??= { description: 'Erro interno inesperado' };
    if (metodo === 'post') operacao.responses['409'] ??= { description: 'Registro duplicado' };
  }
}
