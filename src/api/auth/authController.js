import * as authService from "./authService.js";

export async function login(req, res, next) {
  try {
    const resultado = await authService.login(req.body);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function confirmarCadastro(req, res, next) {
  try {
    const { token } = req.query;
    const resultado = await authService.confirmarCadastro(token);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}
