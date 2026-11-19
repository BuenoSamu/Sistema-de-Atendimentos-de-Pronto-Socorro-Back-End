import { STATUS_ATENDIMENTO } from "../../config/dominio.js";
import * as atendimentosRepository from "./atendimentosRepository.js";

export async function listarAtendimentos(req, res, next) {
  try {
    const { status, id_paciente } = req.query;
    const filtros = {};

    if (status) {
      const statusFormatado = status.toUpperCase();

      if (!STATUS_ATENDIMENTO.includes(statusFormatado)) {
        return res.status(400).json({
          mensagem: "Status do atendimento inválido."
        });
      }
      filtros.status = statusFormatado;
    }

    if (id_paciente) {
      const idPaciente = Number(id_paciente);

      if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
        return res.status(400).json({
          mensagem: "ID do paciente inválido."
        });
      }
      filtros.idPaciente = idPaciente;
    }

    const atendimentos = await atendimentosRepository.listar(filtros);
    return res.status(200).json(atendimentos);

  } catch (error) {
    next(error);
  }
}

export async function buscarAtendimentoPorId(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    const atendimento = await atendimentosRepository.buscarPorId(id);

    if (!atendimento) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    return res.status(200).json(atendimento);

  } catch (error) {
    next(error);
  }
}

export async function cadastrarAtendimento(req, res, next) {
  try {
    const { id_paciente } = req.body;

    if (!id_paciente) {
      return res.status(400).json({
        mensagem: "O ID do paciente é obrigatório."
      });
    }

    const idPaciente = Number(id_paciente);

    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      return res.status(400).json({
        mensagem: "ID do paciente inválido."
      });
    }

    const existe = await atendimentosRepository.pacienteExiste(idPaciente);

    if (!existe) {
      return res.status(404).json({
        mensagem: "Paciente não encontrado."
      });
    }

    const idAtendimento = await atendimentosRepository.criar(idPaciente);

    return res.status(201).json({
      mensagem: "Atendimento criado com sucesso.",
      id_atendimento: idAtendimento
    });

  } catch (error) {
    next(error);
  }
}

export async function atualizarAtendimento(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        mensagem: "O status do atendimento é obrigatório."
      });
    }

    const novoStatus = status.toUpperCase();

    if (!STATUS_ATENDIMENTO.includes(novoStatus)) {
      return res.status(400).json({
        mensagem: "Status do atendimento inválido."
      });
    }

    const atendimento = await atendimentosRepository.buscarPorId(id);

    if (!atendimento) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    const registrarSaida = novoStatus === "FINALIZADO" || novoStatus === "CANCELADO";
    await atendimentosRepository.atualizarStatus(id, novoStatus, registrarSaida);

    return res.status(200).json({
      mensagem: "Atendimento atualizado com sucesso."
    });

  } catch (error) {
    next(error);
  }
}