import { pool } from "../../config/db.js";

export async function findAll() {
  const [rows] = await pool.query(
    "SELECT id_usuario, nome_completo, email FROM usuarios ORDER BY id_usuario DESC",
  );
  return rows;
}

export async function findByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] || null;
}

export async function create(data) {
  const sql = `
    INSERT INTO usuarios (
      nome_completo,
      email,
      senha_hash
    ) VALUES (?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    data.nome_completo,
    data.email,
    data.senha_hash,
  ]);

  return {
    id_usuario: result.insertId,
    nome_completo: data.nome_completo,
    email: data.email,
  };
}
