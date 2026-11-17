import { pool } from "../../config/db.js";


export async function listarConsultas(req, res, next) {
  try {
    const [consultas] = await pool.query(
      "SELECT * FROM consultas ORDER BY id_consulta ASC"
    );

    return res.status(200).json(consultas);

  } catch (error) {
    next(error);
  }
}


export async function buscarConsultaPorId(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da consulta inválido."
      });
    }

    const [consultas] = await pool.query(
      "SELECT * FROM consultas WHERE id_consulta = ?",
      [id]
    );

    if (consultas.length === 0) {
      return res.status(404).json({
        mensagem: "Consulta não encontrada."
      });
    }

    return res.status(200).json(consultas[0]);

  } catch (error) {
    next(error);
  }
}


export async function cadastrarConsulta(req, res, next) {
  try {
    const {
      id_atendimento,
      observacoes
    } = req.body;

    if (!id_atendimento) {
      return res.status(400).json({
        mensagem: "ID do atendimento é obrigatório."
      });
    }

    const idAtendimento = Number(id_atendimento);

    if (!Number.isInteger(idAtendimento) || idAtendimento <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    const [atendimentos] = await pool.query(
      "SELECT id_atendimento FROM atendimentos WHERE id_atendimento = ?",
      [idAtendimento]
    );

    if (atendimentos.length === 0) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    const [consultasExistentes] = await pool.query(
      "SELECT id_consulta FROM consultas WHERE id_atendimento = ?",
      [idAtendimento]
    );

    if (consultasExistentes.length > 0) {
      return res.status(409).json({
        mensagem: "Este atendimento já possui uma consulta cadastrada."
      });
    }

    const [resultado] = await pool.query(
      `
      INSERT INTO consultas (
        id_atendimento,
        observacoes
      )
      VALUES (?, ?)
      `,
      [
        idAtendimento,
        observacoes ?? null
      ]
    );

    return res.status(201).json({
      mensagem: "Consulta cadastrada com sucesso.",
      id_consulta: resultado.insertId
    });

  } catch (error) {
    next(error);
  }
}


export async function atualizarConsulta(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da consulta inválido."
      });
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, "observacoes")) {
      return res.status(400).json({
        mensagem: "Nenhum dado válido foi informado para atualização."
      });
    }

    const { observacoes } = req.body;

    const [consultas] = await pool.query(
      "SELECT id_consulta FROM consultas WHERE id_consulta = ?",
      [id]
    );

    if (consultas.length === 0) {
      return res.status(404).json({
        mensagem: "Consulta não encontrada."
      });
    }

    await pool.query(
      `
      UPDATE consultas
      SET observacoes = ?
      WHERE id_consulta = ?
      `,
      [
        observacoes ?? null,
        id
      ]
    );

    return res.status(200).json({
      mensagem: "Consulta atualizada com sucesso."
    });

  } catch (error) {
    next(error);
  }
}