import * as service from "./usuariosService.js";

export async function getAll(req, res, next) {
  try {
    const data = await service.getAll();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const novo = await service.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
}
