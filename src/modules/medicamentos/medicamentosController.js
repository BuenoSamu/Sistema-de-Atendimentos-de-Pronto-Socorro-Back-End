import * as services from "./medicamentosServices.js";

export async function getAll(req, res, next) {
  try {
    const data = await services.getAll();

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = await services.getById(id);

    if (!data) {
      return res.status(404).json({
        message: "Medicamento não encontrado",
      });
    }

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const novo = await services.create(req.body);

    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
}
