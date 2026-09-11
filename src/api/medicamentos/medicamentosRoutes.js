import { Router } from "express";
import { autenticarJWT } from "../../middlewares/auth.js";
import * as controller from "./medicamentosController.js";

const router = Router();

/**
 * @swagger
 * /api/medicamentos:
 *   get:
 *     summary: Lista todos os medicamentos
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get("/", autenticarJWT, controller.getAll);

/**
 * @swagger
 * /api/medicamentos/{id}:
 *   get:
 *     summary: Busca medicamento por ID
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Medicamento encontrado
 *       404:
 *         description: Medicamento não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:id", autenticarJWT, controller.getById);

/**
 * @swagger
 * /api/medicamentos:
 *   post:
 *     summary: Cria um novo medicamento
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome_medicamento
 *             properties:
 *               nome_medicamento:
 *                 type: string
 *                 example: Dipirona
 *     responses:
 *       201:
 *         description: Medicamento criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post("/", autenticarJWT, controller.create);

export default router;
