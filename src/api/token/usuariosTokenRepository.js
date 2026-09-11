import { pool } from "../../config/db.js";

export async function createToken(id_usuario, codigo_token, validade_token) {
  const sql = `
    INSERT INTO usuariostokens (id_usuario, codigo_token, validade_token, usado)
    VALUES (?, ?, ?, 0)
  `;

  await pool.query(sql, [id_usuario, codigo_token, validade_token]);
}

export async function findByToken(codigo_token) {
  const [rows] = await pool.query(
    "SELECT * FROM usuariostokens WHERE codigo_token = ? LIMIT 1",
    [codigo_token],
  );
  return rows[0] || null;
}

export async function markAsUsed(id) {
  await pool.query("UPDATE usuariostokens SET usado = 1 WHERE id = ?", [id]);
}
