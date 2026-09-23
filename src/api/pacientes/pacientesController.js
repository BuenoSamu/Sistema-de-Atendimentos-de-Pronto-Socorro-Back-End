// Importa a conexão com o banco de dados.
import { pool } from "../../config/db.js";

// Cria uma função chamada listarPacientes.
export async function listarPacientes(req, res, next) {
  try {
    // Pega o parâmetro "nome" enviado na URL.
    // Exemplo: /api/pacientes?nome=Maria
    const { nome } = req.query;

    // Se foi enviado um nome para pesquisa...
    if (nome) {
      // Executa uma consulta SQL buscando pacientes cujo nome contenha
      // o texto informado pelo usuário.
      const [pacientes] = await pool.query(
        `
        SELECT *
        FROM pacientes
        WHERE nome_completo LIKE ?
        ORDER BY nome_completo ASC
        `,
        [`%${nome}%`]
      );

      // Retorna os pacientes encontrados em formato JSON
      // com status 200 (OK).
      return res.status(200).json(pacientes);
    }

    // Se nenhum nome foi informado, executa uma consulta SQL
    // para buscar todos os pacientes cadastrados.
    const [pacientes] = await pool.query(
      "SELECT * FROM pacientes ORDER BY nome_completo ASC"
    );

    // Retorna todos os pacientes em formato JSON
    // com status 200 (OK).
    return res.status(200).json(pacientes);

    // Caso ocorra algum erro durante a execução das consultas,
    // ele será capturado e enviado para o middleware de tratamento de erros.
  } catch (error) {
    next(error);
  }
}

// Cria uma função chamada cadastrarPaciente.
export async function cadastrarPaciente(req, res, next) {
  try {
    // Pega os dados enviados no corpo da requisição.
    const {
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      nome_pai,
      nome_mae,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      cep
    } = req.body;

    // Verifica se os campos obrigatórios foram informados.
    if (!nome_completo || !data_nascimento) {
      return res.status(400).json({
        mensagem: "Nome completo e data de nascimento são obrigatórios."
      });
    }

    // Insere o novo paciente no banco de dados.
    const [resultado] = await pool.query(
      `
      INSERT INTO pacientes (
        nome_completo,
        cpf,
        rg,
        data_nascimento,
        nome_pai,
        nome_mae,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nome_completo,
        cpf || null,
        rg || null,
        data_nascimento,
        nome_pai || null,
        nome_mae || null,
        logradouro || null,
        numero || null,
        bairro || null,
        cidade || null,
        estado || null,
        cep || null
      ]
    );

    // Retorna o ID criado e uma mensagem de sucesso.
    return res.status(201).json({
      mensagem: "Paciente cadastrado com sucesso.",
      id_paciente: resultado.insertId
    });

  } catch (error) {
    // Caso o CPF já exista, o MySQL retorna erro de registro duplicado.
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um paciente cadastrado com esse CPF."
      });
    }

    // Outros erros são enviados para o middleware global.
    next(error);
  }
}

// Cria uma função chamada atualizarPaciente.
export async function atualizarPaciente(req, res, next) {
  try {
    // Pega o ID informado na URL.
    // Exemplo: /api/pacientes/1
    const id = Number(req.params.id);

    // Verifica se o ID informado é válido.
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do paciente inválido."
      });
    }

    // Verifica se foi enviado pelo menos um campo para alteração.
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        mensagem: "Nenhum dado foi informado para atualização."
      });
    }

    // Pega os campos enviados no corpo da requisição.
    const {
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      nome_pai,
      nome_mae,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      cep
    } = req.body;

    // Atualiza o paciente.
    // COALESCE mantém o valor atual quando o campo não é enviado.
    const [resultado] = await pool.query(
      `
      UPDATE pacientes
      SET
        nome_completo = COALESCE(?, nome_completo),
        cpf = COALESCE(?, cpf),
        rg = COALESCE(?, rg),
        data_nascimento = COALESCE(?, data_nascimento),
        nome_pai = COALESCE(?, nome_pai),
        nome_mae = COALESCE(?, nome_mae),
        logradouro = COALESCE(?, logradouro),
        numero = COALESCE(?, numero),
        bairro = COALESCE(?, bairro),
        cidade = COALESCE(?, cidade),
        estado = COALESCE(?, estado),
        cep = COALESCE(?, cep)
      WHERE id_paciente = ?
      `,
      [
        nome_completo ?? null,
        cpf ?? null,
        rg ?? null,
        data_nascimento ?? null,
        nome_pai ?? null,
        nome_mae ?? null,
        logradouro ?? null,
        numero ?? null,
        bairro ?? null,
        cidade ?? null,
        estado ?? null,
        cep ?? null,
        id
      ]
    );

    // Se nenhuma linha foi alterada/encontrada, o paciente não existe.
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Paciente não encontrado."
      });
    }

    // Retorna uma mensagem de sucesso.
    return res.status(200).json({
      mensagem: "Paciente atualizado com sucesso."
    });

  } catch (error) {
    // Caso o novo CPF já pertença a outro paciente.
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um paciente cadastrado com esse CPF."
      });
    }

    // Outros erros são enviados ao middleware de tratamento de erros.
    next(error);
  }
}