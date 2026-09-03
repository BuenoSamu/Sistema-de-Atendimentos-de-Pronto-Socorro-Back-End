import { Router } from "express";
import * as controller from "./medicamentosController.js";

const router = Router();

/**
 * @swagger
 * /api/medicamentos:
 *   get:
 *     summary: Lista todos os medicamentos
 *     tags: [Medicamentos]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/medicamentos/{id}:
 *   get:
 *     summary: Busca medicamento por ID
 *     tags: [Medicamentos]
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
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/medicamentos:
 *   post:
 *     summary: Cria um novo medicamento
 *     tags: [Medicamentos]
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
 */
router.post("/", controller.create);

export default router;
