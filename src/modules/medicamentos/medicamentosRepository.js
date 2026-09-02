import { pool } from "../../config/db.js";

export async function findAll() {
  const [rows] = await pool.query(
    "SELECT * FROM medicamentos ORDER BY id_medicamento DESC",
  );
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM medicamentos WHERE id_medicamento = ?",
    [id],
  );
  return rows[0] || null;
}

export async function create(data) {
  const sql = `
        INSERT INTO medicamentos (
            nome_medicamento
        ) VALUES (?)
    `;
  const params = [data.nome_medicamento];

  const [result] = await pool.query(sql, params);
  return { id_medicamento: result.insertId, ...data };
}
