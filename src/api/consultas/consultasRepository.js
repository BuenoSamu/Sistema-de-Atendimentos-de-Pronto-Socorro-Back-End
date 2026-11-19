import { pool } from "../../config/db.js";

export async function listar() {
  const [consultas] = await pool.query(
    "SELECT * FROM consultas ORDER BY id_consulta ASC"
  );
  return consultas;
}

export async function buscarPorId(id) {
  const [consultas] = await pool.query(
    "SELECT * FROM consultas WHERE id_consulta = ?",
    [id]
  );
  return consultas[0] || null;
}

export async function atendimentoExiste(idAtendimento) {
  const [atendimentos] = await pool.query(
    "SELECT id_atendimento FROM atendimentos WHERE id_atendimento = ?",
    [idAtendimento]
  );
  return atendimentos.length > 0;
}

export async function consultaExiste(idAtendimento) {
  const [consultas] = await pool.query(
    "SELECT id_consulta FROM consultas WHERE id_atendimento = ?",
    [idAtendimento]
  );
  return consultas.length > 0;
}

export async function criar(idAtendimento, observacoes) {
  const [resultado] = await pool.query(
    "INSERT INTO consultas (id_atendimento, observacoes) VALUES (?, ?)",
    [idAtendimento, observacoes]
  );
  return resultado.insertId;
}

export async function atualizar(id, observacoes) {
  const [resultado] = await pool.query(
    "UPDATE consultas SET observacoes = ? WHERE id_consulta = ?",
    [observacoes, id]
  );
  return resultado.affectedRows;
}