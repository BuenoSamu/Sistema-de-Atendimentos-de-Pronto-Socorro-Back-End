import { pool } from "../../config/db.js";

const CAMPOS_PERMITIDOS = [
  "nome_completo",
  "cpf",
  "rg",
  "data_nascimento",
  "nome_pai",
  "nome_mae",
  "logradouro",
  "numero",
  "bairro",
  "cidade",
  "estado",
  "cep"
];

export async function listar(nome) {
  let sql = "SELECT * FROM pacientes";
  const valores = [];

  if (nome) {
    sql += " WHERE nome_completo LIKE ?";
    valores.push(`%${nome}%`);
  }

  sql += " ORDER BY nome_completo ASC";

  const [pacientes] = await pool.query(sql, valores);
  return pacientes;
}

export async function buscarPorId(id) {
  const [pacientes] = await pool.query(
    "SELECT * FROM pacientes WHERE id_paciente = ?",
    [id]
  );
  return pacientes[0] || null;
}

export async function criar(dados) {
  const [resultado] = await pool.query(
    `
    INSERT INTO pacientes (
      nome_completo, cpf, rg, data_nascimento,
      nome_pai, nome_mae,
      logradouro, numero, bairro, cidade, estado, cep
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      dados.nome_completo,
      dados.cpf,
      dados.rg,
      dados.data_nascimento,
      dados.nome_pai,
      dados.nome_mae,
      dados.logradouro,
      dados.numero,
      dados.bairro,
      dados.cidade,
      dados.estado,
      dados.cep
    ]
  );
  return resultado.insertId;
}

export async function atualizar(id, dados) {
  // Só usa colunas da lista permitida, nunca nomes vindos direto do body no SQL.
  const campos = Object.keys(dados).filter(campo =>
    CAMPOS_PERMITIDOS.includes(campo)
  );

  if (campos.length === 0) {
    return 0;
  }

  const atribuicoes = campos.map(campo => `${campo} = COALESCE(?, ${campo})`).join(", ");
  const valores = campos.map(campo => dados[campo]);

  const [resultado] = await pool.query(
    `UPDATE pacientes SET ${atribuicoes} WHERE id_paciente = ?`,
    [...valores, id]
  );
  return resultado.affectedRows;
}