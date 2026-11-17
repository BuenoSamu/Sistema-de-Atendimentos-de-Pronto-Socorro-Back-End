import { validarEntrada } from "../../middlewares/validarEntrada.js";
import { Router } from "express";

import { listarAtendimentos, buscarAtendimentoPorId, cadastrarAtendimento, atualizarAtendimento } from "./atendimentosController.js";

const router = Router();
/**
 * @swagger
 * /api/atendimentos:
 *   get:
 *     summary: Lista todos os atendimentos ou aplica filtros
 *     tags: [Atendimentos]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - TRIAGEM_PENDENTE
 *             - CONSULTA_PENDENTE
 *             - FINALIZADO
 *             - CANCELADO
 *         description: Filtra os atendimentos pelo status
 *
 *       - in: query
 *         name: id_paciente
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtra os atendimentos pelo ID do paciente
 *
 *     responses:
 *       200:
 *         description: Lista de atendimentos retornada com sucesso
 *       400:
 *         description: Filtro inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", validarEntrada, listarAtendimentos);

/**
 * @swagger
 * /api/atendimentos/{id}:
 *   get:
 *     summary: Busca um atendimento pelo ID
 *     tags: [Atendimentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do atendimento
 *     responses:
 *       200:
 *         description: Atendimento encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Atendimento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", validarEntrada, buscarAtendimentoPorId);

/**
 * @swagger
 * /api/atendimentos:
 *   post:
 *     summary: Cria um novo atendimento para um paciente
 *     tags: [Atendimentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_paciente
 *             properties:
 *               id_paciente:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Atendimento criado com sucesso
 *       400:
 *         description: ID do paciente inválido ou não informado
 *       404:
 *         description: Paciente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validarEntrada, cadastrarAtendimento);

/**
 * @swagger
 * /api/atendimentos/{id}:
 *   patch:
 *     summary: Atualiza o status de um atendimento
 *     tags: [Atendimentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do atendimento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - TRIAGEM_PENDENTE
 *                   - CONSULTA_PENDENTE
 *                   - FINALIZADO
 *                   - CANCELADO
 *                 example: CONSULTA_PENDENTE
 *     responses:
 *       200:
 *         description: Atendimento atualizado com sucesso
 *       400:
 *         description: ID ou status inválido
 *       404:
 *         description: Atendimento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch("/:id", validarEntrada, atualizarAtendimento);

export default router;