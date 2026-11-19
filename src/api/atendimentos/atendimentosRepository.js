import { pool } from "../../config/db.js";

export async function listar({ status, idPaciente } = {}) {
  let sql = "SELECT * FROM atendimentos";
  const condicoes = [];
  const valores = [];

  if (status) {
    condicoes.push("status = ?");
    valores.push(status);
  }

  if (idPaciente) {
    condicoes.push("id_paciente = ?");
    valores.push(idPaciente);
  }

  if (condicoes.length > 0) {
    sql += ` WHERE ${condicoes.join(" AND ")}`;
  }

  sql += " ORDER BY id_atendimento ASC";

  const [atendimentos] = await pool.query(sql, valores);
  return atendimentos;
}

export async function buscarPorId(id) {
  const [atendimentos] = await pool.query(
    "SELECT * FROM atendimentos WHERE id_atendimento = ?",
    [id]
  );
  return atendimentos[0] || null;
}

export async function pacienteExiste(idPaciente) {
  const [pacientes] = await pool.query(
    "SELECT id_paciente FROM pacientes WHERE id_paciente = ?",
    [idPaciente]
  );
  return pacientes.length > 0;
}

export async function criar(idPaciente) {
  const [resultado] = await pool.query(
    "INSERT INTO atendimentos (id_paciente) VALUES (?)",
    [idPaciente]
  );
  return resultado.insertId;
}

export async function atualizarStatus(id, status, registrarSaida) {
  const sql = registrarSaida
    ? `UPDATE atendimentos
       SET status = ?, data_hora_saida = CURRENT_TIMESTAMP
       WHERE id_atendimento = ?`
    : `UPDATE atendimentos
       SET status = ?, data_hora_saida = NULL
       WHERE id_atendimento = ?`;

  const [resultado] = await pool.query(sql, [status, id]);
  return resultado.affectedRows;
}