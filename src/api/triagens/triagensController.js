import { CLASSIFICACOES_MANCHESTER } from "../../config/dominio.js";
import { pool } from "../../config/db.js";
export async function listarTriagens(req, res, next) {
  try {
    const { classificacao } = req.query;
    if (classificacao) {
      const classificacaoFormatada = classificacao.toUpperCase();


      if (!CLASSIFICACOES_MANCHESTER.includes(classificacaoFormatada)) {
        return res.status(400).json({
          mensagem: "Classificação Manchester inválida."
        });
      }

      const [triagens] = await pool.query(
        `
        SELECT *
        FROM triagens
        WHERE classificacao_manchester = ?
        ORDER BY id_triagem ASC
        `,
        [classificacaoFormatada]
      );
      return res.status(200).json(triagens);
    }

    const [triagens] = await pool.query(
      "SELECT * FROM triagens ORDER BY id_triagem ASC"
    );
    return res.status(200).json(triagens);

  } catch (error) {

    next(error);
  }
}
export async function buscarTriagemPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da triagem inválido."
      });
    }

    const [triagens] = await pool.query(
      "SELECT * FROM triagens WHERE id_triagem = ?",
      [id]
    );

    if (triagens.length === 0) {
      return res.status(404).json({
        mensagem: "Triagem não encontrada."
      });
    }
    return res.status(200).json(triagens[0]);

  } catch (error) {

    next(error);
  }
}
export async function cadastrarTriagem(req, res, next) {
  try {
    const {
      id_atendimento,
      pressao_sistolica,
      pressao_diastolica,
      temperatura,
      batimentos_cardiacos,
      queixas,
      classificacao_manchester
    } = req.body;

    if (!id_atendimento || !classificacao_manchester) {
      return res.status(400).json({
        mensagem:
          "ID do atendimento e classificação Manchester são obrigatórios."
      });
    }
    const idAtendimento = Number(id_atendimento);
    if (!Number.isInteger(idAtendimento) || idAtendimento <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    const classificacao = classificacao_manchester.toUpperCase();

    if (!CLASSIFICACOES_MANCHESTER.includes(classificacao)) {
      return res.status(400).json({
        mensagem: "Classificação Manchester inválida."
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

    const [triagensExistentes] = await pool.query(
      "SELECT id_triagem FROM triagens WHERE id_atendimento = ?",
      [idAtendimento]
    );

    if (triagensExistentes.length > 0) {
      return res.status(409).json({
        mensagem: "Este atendimento já possui uma triagem cadastrada."
      });
    }

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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        idAtendimento,
        pressao_sistolica ?? null,
        pressao_diastolica ?? null,
        temperatura ?? null,
        batimentos_cardiacos ?? null,
        queixas ?? null,
        classificacao
      ]
    );
    return res.status(201).json({
      mensagem: "Triagem cadastrada com sucesso.",
      id_triagem: resultado.insertId
    });

  } catch (error) {

    next(error);
  }
}
export async function atualizarTriagem(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da triagem inválido."
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        mensagem: "Nenhum dado foi informado para atualização."
      });
    }
    const {
      pressao_sistolica,
      pressao_diastolica,
      temperatura,
      batimentos_cardiacos,
      queixas,
      classificacao_manchester
    } = req.body;

    if (classificacao_manchester !== undefined) {



      const classificacao =
        classificacao_manchester.toUpperCase();

      if (!CLASSIFICACOES_MANCHESTER.includes(classificacao)) {
        return res.status(400).json({
          mensagem: "Classificação Manchester inválida."
        });
      }
    }

    const [triagens] = await pool.query(
      "SELECT id_triagem FROM triagens WHERE id_triagem = ?",
      [id]
    );

    if (triagens.length === 0) {
      return res.status(404).json({
        mensagem: "Triagem não encontrada."
      });
    }

    const campos = [];
    const valores = [];

    if (pressao_sistolica !== undefined) {
      campos.push("pressao_sistolica = ?");
      valores.push(pressao_sistolica);
    }

    if (pressao_diastolica !== undefined) {
      campos.push("pressao_diastolica = ?");
      valores.push(pressao_diastolica);
    }

    if (temperatura !== undefined) {
      campos.push("temperatura = ?");
      valores.push(temperatura);
    }

    if (batimentos_cardiacos !== undefined) {
      campos.push("batimentos_cardiacos = ?");
      valores.push(batimentos_cardiacos);
    }

    if (queixas !== undefined) {
      campos.push("queixas = ?");
      valores.push(queixas);
    }

    if (classificacao_manchester !== undefined) {
      campos.push("classificacao_manchester = ?");
      valores.push(classificacao_manchester.toUpperCase());
    }

    if (campos.length === 0) {
      return res.status(400).json({
        mensagem: "Nenhum campo válido foi informado para atualização."
      });
    }
    valores.push(id);
    await pool.query(
      `
      UPDATE triagens
      SET ${campos.join(", ")}
      WHERE id_triagem = ?
      `,
      valores
    );
    return res.status(200).json({
      mensagem: "Triagem atualizada com sucesso."
    });

  } catch (error) {

    next(error);
  }
}