import * as pacientesRepository from "./pacientesRepository.js";

export async function listarPacientes(req, res, next) {
  try {
    const { nome } = req.query;

    const pacientes = await pacientesRepository.listar(nome);

    return res.status(200).json(pacientes);

  } catch (error) {
    next(error);
  }
}

export async function cadastrarPaciente(req, res, next) {
  try {
    const {
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      nome_pai,
      nome_mae,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      cep
    } = req.body;

    if (!nome_completo || !data_nascimento) {
      return res.status(400).json({
        mensagem: "Nome completo e data de nascimento são obrigatórios."
      });
    }

    const idPaciente = await pacientesRepository.criar({
      nome_completo,
      cpf: cpf || null,
      rg: rg || null,
      data_nascimento,
      nome_pai: nome_pai || null,
      nome_mae: nome_mae || null,
      logradouro: logradouro || null,
      numero: numero || null,
      bairro: bairro || null,
      cidade: cidade || null,
      estado: estado || null,
      cep: cep || null
    });

    return res.status(201).json({
      mensagem: "Paciente cadastrado com sucesso.",
      id_paciente: idPaciente
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um paciente cadastrado com esse CPF."
      });
    }

    next(error);
  }
}

export async function atualizarPaciente(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do paciente inválido."
      });
    }

    const camposPermitidos = [
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

    if (!Object.keys(req.body).some(campo => camposPermitidos.includes(campo))) {
      return res.status(400).json({
        mensagem: "Nenhum dado foi informado para atualização."
      });
    }

    const paciente = await pacientesRepository.buscarPorId(id);

    if (!paciente) {
      return res.status(404).json({
        mensagem: "Paciente não encontrado."
      });
    }

    await pacientesRepository.atualizar(id, req.body);

    return res.status(200).json({
      mensagem: "Paciente atualizado com sucesso."
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um paciente cadastrado com esse CPF."
      });
    }

    next(error);
  }
}