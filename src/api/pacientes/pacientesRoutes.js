// Importa Router do Express e a função listarPacientes do controlador de pacientes
import { Router } from 'express';
import { listarPacientes, cadastrarPaciente, atualizarPaciente } from "./pacientesController.js";

const router = Router(); // Cria uma instância do Router do Express

// Documentação Swagger para a rota GET /api/pacientes
/**
 * @swagger
 * /api/pacientes:
 *   get:
 *     summary: Lista todos os pacientes ou busca pacientes pelo nome
 *     tags: [Pacientes]
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome ou parte do nome do paciente
 *         example: Maria
 *     responses:
 *       200:
 *         description: Lista de pacientes retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */

router.get("/", listarPacientes);

// Documentação Swagger para a rota POST /api/pacientes
/**
 * @swagger
 * /api/pacientes:
 *   post:
 *     summary: Cadastra um novo paciente
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome_completo
 *               - data_nascimento
 *             properties:
 *               nome_completo:
 *                 type: string
 *                 example: Maria da Silva
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *               rg:
 *                 type: string
 *                 example: "123456789"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 example: "2000-05-20"
 *               nome_pai:
 *                 type: string
 *                 example: José da Silva
 *               nome_mae:
 *                 type: string
 *                 example: Ana da Silva
 *               logradouro:
 *                 type: string
 *                 example: Rua das Flores
 *               numero:
 *                 type: string
 *                 example: "150"
 *               bairro:
 *                 type: string
 *                 example: Centro
 *               cidade:
 *                 type: string
 *                 example: Valinhos
 *               estado:
 *                 type: string
 *                 example: SP
 *               cep:
 *                 type: string
 *                 example: "13270000"
 *     responses:
 *       201:
 *         description: Paciente cadastrado com sucesso
 *       400:
 *         description: Dados obrigatórios não informados
 *       409:
 *         description: CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", cadastrarPaciente);

// Documentação Swagger para a rota PATCH /api/pacientes/{id}
/**
 * @swagger
 * /api/pacientes/{id}:
 *   patch:
 *     summary: Atualiza os dados de um paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome_completo:
 *                 type: string
 *               cpf:
 *                 type: string
 *               rg:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               nome_pai:
 *                 type: string
 *               nome_mae:
 *                 type: string
 *               logradouro:
 *                 type: string
 *               numero:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Paciente não encontrado
 *       409:
 *         description: CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch("/:id", atualizarPaciente);    

export default router; // Exporta o router para ser usado em outros arquivos.
