import { pool } from "../../config/db.js";
export async function listarPacientes(req, res, next) {
  try {
    const { nome } = req.query;
    if (nome) {
      const [pacientes] = await pool.query(
        `
        SELECT *
        FROM pacientes
        WHERE nome_completo LIKE ?
        ORDER BY nome_completo ASC
        `,
        [`%${nome}%`]
      );
      return res.status(200).json(pacientes);
    }
    const [pacientes] = await pool.query(
      "SELECT * FROM pacientes ORDER BY nome_completo ASC"
    );
    return res.status(200).json(pacientes);

  } catch (error) {
    next(error);
  }
}
export async function cadastrarPaciente(req, res, next) {
  try {
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

    if (!nome_completo || !data_nascimento) {
      return res.status(400).json({
        mensagem: "Nome completo e data de nascimento são obrigatórios."
      });
    }

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
    return res.status(201).json({
      mensagem: "Paciente cadastrado com sucesso.",
      id_paciente: resultado.insertId
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um paciente cadastrado com esse CPF."
      });
    }

    next(error);
  }
}
export async function atualizarPaciente(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do paciente inválido."
      });
    }

    if (!Object.keys(req.body).some(campo => ["nome_completo", "cpf", "rg", "data_nascimento", "nome_pai", "nome_mae", "logradouro", "numero", "bairro", "cidade", "estado", "cep"].includes(campo))) {
      return res.status(400).json({
        mensagem: "Nenhum dado foi informado para atualização."
      });
    }
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

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Paciente não encontrado."
      });
    }
    return res.status(200).json({
      mensagem: "Paciente atualizado com sucesso."
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um paciente cadastrado com esse CPF."
      });
    }

    next(error);
  }
}