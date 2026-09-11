import { Router } from "express";
import * as controller from "./authController.js";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login e gera um token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 example: minhaSenha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Email ou senha inválidos
 */
router.post("/login", controller.login);

/**
 * @swagger
 * /api/auth/confirmar-cadastro:
 *   get:
 *     summary: Confirma o cadastro do usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cadastro confirmado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.get("/confirmar-cadastro", controller.confirmarCadastro);

export default router;
