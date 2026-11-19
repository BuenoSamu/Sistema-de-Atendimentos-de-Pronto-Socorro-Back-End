import * as consultasRepository from "./consultasRepository.js";

export async function listarConsultas(req, res, next) {
  try {
    const consultas = await consultasRepository.listar();

    return res.status(200).json(consultas);

  } catch (error) {
    next(error);
  }
}

export async function buscarConsultaPorId(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da consulta inválido."
      });
    }

    const consulta = await consultasRepository.buscarPorId(id);

    if (!consulta) {
      return res.status(404).json({
        mensagem: "Consulta não encontrada."
      });
    }

    return res.status(200).json(consulta);

  } catch (error) {
    next(error);
  }
}

export async function cadastrarConsulta(req, res, next) {
  try {
    const {
      id_atendimento,
      observacoes
    } = req.body;

    if (!id_atendimento) {
      return res.status(400).json({
        mensagem: "ID do atendimento é obrigatório."
      });
    }

    const idAtendimento = Number(id_atendimento);

    if (!Number.isInteger(idAtendimento) || idAtendimento <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    const existe = await consultasRepository.atendimentoExiste(idAtendimento);

    if (!existe) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    const consultaExistente = await consultasRepository.consultaExiste(idAtendimento);

    if (consultaExistente) {
      return res.status(409).json({
        mensagem: "Este atendimento já possui uma consulta cadastrada."
      });
    }

    const idConsulta = await consultasRepository.criar(
      idAtendimento,
      observacoes ?? null
    );

    return res.status(201).json({
      mensagem: "Consulta cadastrada com sucesso.",
      id_consulta: idConsulta
    });

  } catch (error) {
    next(error);
  }
}

export async function atualizarConsulta(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID da consulta inválido."
      });
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, "observacoes")) {
      return res.status(400).json({
        mensagem: "Nenhum dado válido foi informado para atualização."
      });
    }

    const { observacoes } = req.body;

    const consulta = await consultasRepository.buscarPorId(id);

    if (!consulta) {
      return res.status(404).json({
        mensagem: "Consulta não encontrada."
      });
    }

    await consultasRepository.atualizar(
      id,
      observacoes ?? null
    );

    return res.status(200).json({
      mensagem: "Consulta atualizada com sucesso."
    });

  } catch (error) {
    next(error);
  }
}