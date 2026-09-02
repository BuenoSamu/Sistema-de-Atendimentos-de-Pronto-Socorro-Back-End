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
        url: "http://localhost:3000",
        description: "Local",
      },
    ],
  },

  apis: ["./src/**/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
