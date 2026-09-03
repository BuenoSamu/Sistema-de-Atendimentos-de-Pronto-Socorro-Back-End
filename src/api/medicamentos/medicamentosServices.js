import * as repo from "./medicamentosRepository.js";

export async function getAll() {
  return repo.findAll();
}

export async function getById(id) {
  if (!id || Number.isNaN(id)) {
    throw new Error("ID inválido");
  }

  return repo.findById(id);
}

export async function create(data) {
  if (!data || !data.nome_medicamento) {
    throw new Error("Nome do medicamento é obrigatório");
  }

  return repo.create(data);
}
