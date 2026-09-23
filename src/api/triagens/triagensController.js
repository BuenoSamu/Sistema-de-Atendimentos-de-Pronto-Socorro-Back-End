// Importa a conexão com o banco de dados.
import { pool } from "../../config/db.js";

// Cria uma função chamada listarTriagens.
export async function listarTriagens(req, res, next) {
  try {

    // Pega o parâmetro "classificacao" enviado na URL.
    // Exemplo: /api/triagens?classificacao=VERMELHO
    const { classificacao } = req.query;

    // Se uma classificação foi informada...
    if (classificacao) {

      // Converte a classificação para letras maiúsculas.
      const classificacaoFormatada = classificacao.toUpperCase();

      // Define as classificações permitidas pelo sistema.
      const classificacoesPermitidas = [
        "VERMELHO",
        "LARANJA",
        "AMARELO",
        "VERDE",
        "AZUL"
      ];

      // Verifica se a classificação informada é válida.
      if (!classificacoesPermitidas.includes(classificacaoFormatada)) {
        return res.status(400).json({
          mensagem: "Classificação Manchester inválida."
        });
      }

      // Busca somente as triagens que possuem
      // a classificação informada.
      const [triagens] = await pool.query(
        `
        SELECT *
        FROM triagens
        WHERE classificacao_manchester = ?
        ORDER BY id_triagem ASC
        `,
        [classificacaoFormatada]
      );

      // Retorna as triagens encontradas.
      return res.status(200).json(triagens);
    }

    // Se nenhuma classificação foi informada,
    // busca todas as triagens cadastradas.
    const [triagens] = await pool.query(
      "SELECT * FROM triagens ORDER BY id_triagem ASC"
    );

    // Retorna todas as triagens.
    return res.status(200).json(triagens);

  } catch (error) {

    // Envia possíveis erros para o middleware de tratamento.
    next(error);
  }
}






// Cria uma função chamada buscarTriagemPorId.
export async function buscarTriagemPorId(req, res, next) {
  try {

    // Pega o ID informado na URL.
    // Exemplo: /api/triagens/3
    const id = Number(req.params.id);

    // Verifica se o ID informado é válido.
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da triagem inválido."
      });
    }

    // Busca no banco a triagem que possui o ID informado.
    const [triagens] = await pool.query(
      "SELECT * FROM triagens WHERE id_triagem = ?",
      [id]
    );

    // Se nenhuma triagem for encontrada, retorna erro 404.
    if (triagens.length === 0) {
      return res.status(404).json({
        mensagem: "Triagem não encontrada."
      });
    }

    // Retorna a triagem encontrada com status 200 (OK).
    return res.status(200).json(triagens[0]);

  } catch (error) {

    // Caso ocorra algum erro durante a consulta,
    // envia o erro para o middleware de tratamento de erros.
    next(error);
  }
}





// Cria uma função chamada cadastrarTriagem.
export async function cadastrarTriagem(req, res, next) {
  try {

    // Pega os dados enviados no corpo da requisição.
    const {
      id_atendimento,
      pressao_sistolica,
      pressao_diastolica,
      temperatura,
      batimentos_cardiacos,
      queixas,
      classificacao_manchester
    } = req.body;

    // Verifica se os campos obrigatórios foram informados.
    if (!id_atendimento || !classificacao_manchester) {
      return res.status(400).json({
        mensagem:
          "ID do atendimento e classificação Manchester são obrigatórios."
      });
    }

    // Converte o ID do atendimento para número.
    const idAtendimento = Number(id_atendimento);

    // Verifica se o ID informado é válido.
    if (!Number.isInteger(idAtendimento) || idAtendimento <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    // Define as classificações permitidas pelo sistema.
    const classificacoesPermitidas = [
      "VERMELHO",
      "LARANJA",
      "AMARELO",
      "VERDE",
      "AZUL"
    ];

    // Converte a classificação para letras maiúsculas.
    const classificacao = classificacao_manchester.toUpperCase();

    // Verifica se a classificação enviada é válida.
    if (!classificacoesPermitidas.includes(classificacao)) {
      return res.status(400).json({
        mensagem: "Classificação Manchester inválida."
      });
    }

    // Verifica se o atendimento existe.
    const [atendimentos] = await pool.query(
      "SELECT id_atendimento FROM atendimentos WHERE id_atendimento = ?",
      [idAtendimento]
    );

    // Se o atendimento não existir, retorna erro 404.
    if (atendimentos.length === 0) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    // Verifica se o atendimento já possui uma triagem.
    const [triagensExistentes] = await pool.query(
      "SELECT id_triagem FROM triagens WHERE id_atendimento = ?",
      [idAtendimento]
    );

    // Cada atendimento pode possuir apenas uma triagem.
    if (triagensExistentes.length > 0) {
      return res.status(409).json({
        mensagem: "Este atendimento já possui uma triagem cadastrada."
      });
    }

    // Insere a nova triagem no banco de dados.
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

    // Retorna o ID da triagem criada.
    return res.status(201).json({
      mensagem: "Triagem cadastrada com sucesso.",
      id_triagem: resultado.insertId
    });

  } catch (error) {

    // Envia outros erros para o middleware de tratamento.
    next(error);
  }
}






// Cria uma função chamada atualizarTriagem.
export async function atualizarTriagem(req, res, next) {
  try {

    // Pega o ID da triagem informado na URL.
    // Exemplo: /api/triagens/1
    const id = Number(req.params.id);

    // Verifica se o ID informado é válido.
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da triagem inválido."
      });
    }

    // Verifica se foi enviado pelo menos um campo para atualização.
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        mensagem: "Nenhum dado foi informado para atualização."
      });
    }

    // Pega os campos que podem ser alterados.
    const {
      pressao_sistolica,
      pressao_diastolica,
      temperatura,
      batimentos_cardiacos,
      queixas,
      classificacao_manchester
    } = req.body;

    // Verifica se a classificação Manchester informada é válida.
    if (classificacao_manchester !== undefined) {

      const classificacoesPermitidas = [
        "VERMELHO",
        "LARANJA",
        "AMARELO",
        "VERDE",
        "AZUL"
      ];

      const classificacao =
        classificacao_manchester.toUpperCase();

      if (!classificacoesPermitidas.includes(classificacao)) {
        return res.status(400).json({
          mensagem: "Classificação Manchester inválida."
        });
      }
    }

    // Verifica se a triagem existe.
    const [triagens] = await pool.query(
      "SELECT id_triagem FROM triagens WHERE id_triagem = ?",
      [id]
    );

    // Se nenhuma triagem for encontrada, retorna erro 404.
    if (triagens.length === 0) {
      return res.status(404).json({
        mensagem: "Triagem não encontrada."
      });
    }

    // Cria listas para montar dinamicamente a consulta UPDATE.
    const campos = [];
    const valores = [];

    // Adiciona somente os campos que realmente foram enviados.

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

    // Caso nenhum campo permitido tenha sido enviado.
    if (campos.length === 0) {
      return res.status(400).json({
        mensagem: "Nenhum campo válido foi informado para atualização."
      });
    }

    // Adiciona o ID ao final da lista de valores.
    valores.push(id);

    // Executa a atualização da triagem.
    await pool.query(
      `
      UPDATE triagens
      SET ${campos.join(", ")}
      WHERE id_triagem = ?
      `,
      valores
    );

    // Retorna mensagem de sucesso.
    return res.status(200).json({
      mensagem: "Triagem atualizada com sucesso."
    });

  } catch (error) {

    // Envia possíveis erros para o middleware de tratamento.
    next(error);
  }
}