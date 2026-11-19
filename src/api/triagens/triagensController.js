import { CLASSIFICACOES_MANCHESTER } from "../../config/dominio.js";
import * as triagensRepository from "./triagensRepository.js";

export async function listarTriagens(req, res, next) {
  try {
    const { classificacao } = req.query;
    const filtros = {};

    if (classificacao) {
      const classificacaoFormatada = classificacao.toUpperCase();

      if (!CLASSIFICACOES_MANCHESTER.includes(classificacaoFormatada)) {
        return res.status(400).json({
          mensagem: "Classificação Manchester inválida."
        });
      }

      filtros.classificacao = classificacaoFormatada;
    }

    const triagens = await triagensRepository.listar(filtros);

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

    const triagem = await triagensRepository.buscarPorId(id);

    if (!triagem) {
      return res.status(404).json({
        mensagem: "Triagem não encontrada."
      });
    }

    return res.status(200).json(triagem);

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

    const existe = await triagensRepository.atendimentoExiste(idAtendimento);

    if (!existe) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    const triagemExistente = await triagensRepository.triagemExiste(idAtendimento);

    if (triagemExistente) {
      return res.status(409).json({
        mensagem: "Este atendimento já possui uma triagem cadastrada."
      });
    }

    const idTriagem = await triagensRepository.criar({
      idAtendimento,
      pressao_sistolica: pressao_sistolica ?? null,
      pressao_diastolica: pressao_diastolica ?? null,
      temperatura: temperatura ?? null,
      batimentos_cardiacos: batimentos_cardiacos ?? null,
      queixas: queixas ?? null,
      classificacao_manchester: classificacao
    });

    return res.status(201).json({
      mensagem: "Triagem cadastrada com sucesso.",
      id_triagem: idTriagem
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
      const classificacao = classificacao_manchester.toUpperCase();

      if (!CLASSIFICACOES_MANCHESTER.includes(classificacao)) {
        return res.status(400).json({
          mensagem: "Classificação Manchester inválida."
        });
      }
    }

    const triagem = await triagensRepository.buscarPorId(id);

    if (!triagem) {
      return res.status(404).json({
        mensagem: "Triagem não encontrada."
      });
    }

    const dados = {};

    if (pressao_sistolica !== undefined) {
      dados.pressao_sistolica = pressao_sistolica;
    }

    if (pressao_diastolica !== undefined) {
      dados.pressao_diastolica = pressao_diastolica;
    }

    if (temperatura !== undefined) {
      dados.temperatura = temperatura;
    }

    if (batimentos_cardiacos !== undefined) {
      dados.batimentos_cardiacos = batimentos_cardiacos;
    }

    if (queixas !== undefined) {
      dados.queixas = queixas;
    }

    if (classificacao_manchester !== undefined) {
      dados.classificacao_manchester = classificacao_manchester.toUpperCase();
    }

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({
        mensagem: "Nenhum campo válido foi informado para atualização."
      });
    }

    await triagensRepository.atualizar(id, dados);

    return res.status(200).json({
      mensagem: "Triagem atualizada com sucesso."
    });

  } catch (error) {
    next(error);
  }
}