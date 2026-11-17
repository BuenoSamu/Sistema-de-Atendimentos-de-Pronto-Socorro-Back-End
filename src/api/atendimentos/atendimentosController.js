import { STATUS_ATENDIMENTO } from "../../config/dominio.js";
import { pool } from "../../config/db.js";
export async function listarAtendimentos(req, res, next) {
  try {
    const { status, id_paciente } = req.query;
    let sql = "SELECT * FROM atendimentos";
    const condicoes = [];
    const valores = [];
    if (status) {
      const statusFormatado = status.toUpperCase();

      if (!STATUS_ATENDIMENTO.includes(statusFormatado)) {
        return res.status(400).json({
          mensagem: "Status do atendimento inválido."
        });
      }
      condicoes.push("status = ?");
      valores.push(statusFormatado);
    }
    if (id_paciente) {
      const idPaciente = Number(id_paciente);
      if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
        return res.status(400).json({
          mensagem: "ID do paciente inválido."
        });
      }
      condicoes.push("id_paciente = ?");
      valores.push(idPaciente);
    }

    if (condicoes.length > 0) {
      sql += ` WHERE ${condicoes.join(" AND ")}`;
    }
    sql += " ORDER BY id_atendimento ASC";
    const [atendimentos] = await pool.query(sql, valores);
    return res.status(200).json(atendimentos);

  } catch (error) {

    next(error);
  }
}
export async function buscarAtendimentoPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    const [atendimentos] = await pool.query(
      "SELECT * FROM atendimentos WHERE id_atendimento = ?",
      [id]
    );
    if (atendimentos.length === 0) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }
    return res.status(200).json(atendimentos[0]);

  } catch (error) {
    next(error);
  }
}
export async function cadastrarAtendimento(req, res, next) {
  try {
    const { id_paciente } = req.body;
    if (!id_paciente) {
      return res.status(400).json({
        mensagem: "O ID do paciente é obrigatório."
      });
    }
    const idPaciente = Number(id_paciente);
    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      return res.status(400).json({
        mensagem: "ID do paciente inválido."
      });
    }

    const [pacientes] = await pool.query(
      "SELECT id_paciente FROM pacientes WHERE id_paciente = ?",
      [idPaciente]
    );
    if (pacientes.length === 0) {
      return res.status(404).json({
        mensagem: "Paciente não encontrado."
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO atendimentos (id_paciente) VALUES (?)",
      [idPaciente]
    );
    return res.status(201).json({
      mensagem: "Atendimento criado com sucesso.",
      id_atendimento: resultado.insertId
    });

  } catch (error) {

    next(error);
  }
}
export async function atualizarAtendimento(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        mensagem: "O status do atendimento é obrigatório."
      });
    }

    const novoStatus = status.toUpperCase();
    if (!STATUS_ATENDIMENTO.includes(novoStatus)) {
      return res.status(400).json({
        mensagem: "Status do atendimento inválido."
      });
    }

    const [atendimentos] = await pool.query(
      "SELECT id_atendimento FROM atendimentos WHERE id_atendimento = ?",
      [id]
    );
    if (atendimentos.length === 0) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    if (novoStatus === "FINALIZADO" || novoStatus === "CANCELADO") {
      await pool.query(
        `
        UPDATE atendimentos
        SET status = ?, data_hora_saida = CURRENT_TIMESTAMP
        WHERE id_atendimento = ?
        `,
        [novoStatus, id]
      );

    } else {

      await pool.query(
        `
        UPDATE atendimentos
        SET status = ?, data_hora_saida = NULL
        WHERE id_atendimento = ?
        `,
        [novoStatus, id]
      );
    }
    return res.status(200).json({
      mensagem: "Atendimento atualizado com sucesso."
    });

  } catch (error) {

    next(error);
  }
}