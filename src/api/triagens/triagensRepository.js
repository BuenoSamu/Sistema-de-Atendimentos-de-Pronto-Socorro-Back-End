import { pool } from "../../config/db.js";

const CAMPOS_PERMITIDOS = [
  "pressao_sistolica",
  "pressao_diastolica",
  "temperatura",
  "batimentos_cardiacos",
  "queixas",
  "classificacao_manchester"
];

export async function listar({ classificacao } = {}) {
  let sql = "SELECT * FROM triagens";
  const valores = [];

  if (classificacao) {
    sql += " WHERE classificacao_manchester = ?";
    valores.push(classificacao);
  }

  sql += " ORDER BY id_triagem ASC";

  const [triagens] = await pool.query(sql, valores);
  return triagens;
}

export async function buscarPorId(id) {
  const [triagens] = await pool.query(
    "SELECT * FROM triagens WHERE id_triagem = ?",
    [id]
  );
  return triagens[0] || null;
}

export async function atendimentoExiste(idAtendimento) {
  const [atendimentos] = await pool.query(
    "SELECT id_atendimento FROM atendimentos WHERE id_atendimento = ?",
    [idAtendimento]
  );
  return atendimentos.length > 0;
}

export async function triagemExiste(idAtendimento) {
  const [triagens] = await pool.query(
    "SELECT id_triagem FROM triagens WHERE id_atendimento = ?",
    [idAtendimento]
  );
  return triagens.length > 0;
}

export async function criar(dados) {
  const [resultado] = await pool.query(
    `
    INSERT INTO triagens (
      id_atendimento,
      pressao_sistolica,
      pressao_diastolica,
      temperatura,
      batimentos_cardiacos,
      queixas,
      classificacao_manchester
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      dados.idAtendimento,
      dados.pressao_sistolica,
      dados.pressao_diastolica,
      dados.temperatura,
      dados.batimentos_cardiacos,
      dados.queixas,
      dados.classificacao_manchester
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

  const atribuicoes = campos.map(campo => `${campo} = ?`).join(", ");
  const valores = campos.map(campo => dados[campo]);

  const [resultado] = await pool.query(
    `UPDATE triagens SET ${atribuicoes} WHERE id_triagem = ?`,
    [...valores, id]
  );
  return resultado.affectedRows;
}