import { Router } from "express";
import { autenticarJWT } from "../../middlewares/auth.js";
import * as controller from "./usuariosController.js";

const router = Router();

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome_completo
 *               - email
 *               - senha
 *             properties:
 *               nome_completo:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get("/", autenticarJWT, controller.getAll);

export default router;
