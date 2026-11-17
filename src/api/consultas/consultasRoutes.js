import { validarEntrada } from "../../middlewares/validarEntrada.js";
import { Router } from "express";

import {
  listarConsultas,
  buscarConsultaPorId,
  cadastrarConsulta,
  atualizarConsulta
} from "./consultasController.js";

const router = Router();

/**
 * @swagger
 * /api/consultas:
 *   get:
 *     summary: Lista todas as consultas
 *     tags: [Consultas]
 *     responses:
 *       200:
 *         description: Lista de consultas retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", validarEntrada, listarConsultas);

/**
 * @swagger
 * /api/consultas/{id}:
 *   get:
 *     summary: Busca uma consulta pelo ID
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consulta
 *     responses:
 *       200:
 *         description: Consulta encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Consulta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", validarEntrada, buscarConsultaPorId);

/**
 * @swagger
 * /api/consultas:
 *   post:
 *     summary: Cadastra uma nova consulta
 *     tags: [Consultas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_atendimento
 *             properties:
 *               id_atendimento:
 *                 type: integer
 *                 example: 1
 *               observacoes:
 *                 type: string
 *                 example: Paciente apresenta melhora após avaliação médica.
 *     responses:
 *       201:
 *         description: Consulta cadastrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Atendimento não encontrado
 *       409:
 *         description: Atendimento já possui uma consulta
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validarEntrada, cadastrarConsulta);

/**
 * @swagger
 * /api/consultas/{id}:
 *   patch:
 *     summary: Atualiza uma consulta
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consulta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacoes:
 *                 type: string
 *                 example: Paciente medicado e liberado após observação.
 *     responses:
 *       200:
 *         description: Consulta atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Consulta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch("/:id", validarEntrada, atualizarConsulta);

export default router;