import { validarEntrada } from "../../middlewares/validarEntrada.js";
import { Router } from "express";

import { listarTriagens, buscarTriagemPorId, cadastrarTriagem, atualizarTriagem } from "./triagensController.js";

const router = Router();

/**
 * @swagger
 * /api/triagens:
 *   get:
 *     summary: Lista todas as triagens ou filtra pela classificação Manchester
 *     tags: [Triagens]
 *     parameters:
 *       - in: query
 *         name: classificacao
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - VERMELHO
 *             - LARANJA
 *             - AMARELO
 *             - VERDE
 *             - AZUL
 *         description: Filtra as triagens pela classificação Manchester
 *         example: VERMELHO
 *     responses:
 *       200:
 *         description: Lista de triagens retornada com sucesso
 *       400:
 *         description: Classificação Manchester inválida
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", validarEntrada, listarTriagens);

/**
 * @swagger
 * /api/triagens/{id}:
 *   get:
 *     summary: Busca uma triagem pelo ID
 *     tags: [Triagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da triagem
 *     responses:
 *       200:
 *         description: Triagem encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Triagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", validarEntrada, buscarTriagemPorId);

/**
 * @swagger
 * /api/triagens:
 *   post:
 *     summary: Cadastra uma nova triagem
 *     tags: [Triagens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_atendimento
 *               - classificacao_manchester
 *             properties:
 *               id_atendimento:
 *                 type: integer
 *                 example: 1
 *               pressao_sistolica:
 *                 type: integer
 *                 example: 120
 *               pressao_diastolica:
 *                 type: integer
 *                 example: 80
 *               temperatura:
 *                 type: number
 *                 format: float
 *                 example: 36.5
 *               batimentos_cardiacos:
 *                 type: integer
 *                 example: 75
 *               queixas:
 *                 type: string
 *                 example: Dor de cabeça e náusea
 *               classificacao_manchester:
 *                 type: string
 *                 enum:
 *                   - VERMELHO
 *                   - LARANJA
 *                   - AMARELO
 *                   - VERDE
 *                   - AZUL
 *                 example: AMARELO
 *     responses:
 *       201:
 *         description: Triagem cadastrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Atendimento não encontrado
 *       409:
 *         description: Atendimento já possui uma triagem
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validarEntrada, cadastrarTriagem);

/**
 * @swagger
 * /api/triagens/{id}:
 *   patch:
 *     summary: Atualiza os dados de uma triagem
 *     tags: [Triagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da triagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pressao_sistolica:
 *                 type: integer
 *                 example: 120
 *               pressao_diastolica:
 *                 type: integer
 *                 example: 80
 *               temperatura:
 *                 type: number
 *                 format: float
 *                 example: 37.8
 *               batimentos_cardiacos:
 *                 type: integer
 *                 example: 90
 *               queixas:
 *                 type: string
 *                 example: Dor intensa e tontura
 *               classificacao_manchester:
 *                 type: string
 *                 enum:
 *                   - VERMELHO
 *                   - LARANJA
 *                   - AMARELO
 *                   - VERDE
 *                   - AZUL
 *     responses:
 *       200:
 *         description: Triagem atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Triagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch("/:id", validarEntrada, atualizarTriagem);

export default router;