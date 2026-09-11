export function errorHandler(err, req, res, next) {
  console.error(err);
  res
    .status(400)
    .json({
      message: err.message || "Bad request: Dados da requisição inválidos.",
    });
  res
    .status(401)
    .json({
      message:
        err.message ||
        "Unauthorized: Você precisa estar autenticado para continuar.",
    });
  res
    .status(403)
    .json({
      message:
        err.message ||
        "Forbidden: Você não tem permissão para realizar essa ação.",
    });
  res
    .status(404)
    .json({
      message: err.message || "Not Found: Página e/ou recurso não encontrado.",
    });
  res
    .status(408)
    .json({
      message:
        err.message ||
        "Request Timeout: A requisição demorou muito para responder.",
    });
  res
    .status(409)
    .json({
      message:
        err.message ||
        "Conflict: Não foi possível concluir a operação devido a um conflito.",
    });
  res
    .status(500)
    .json({
      message:
        err.message || "Internal Server Error: Ocorreu um erro interno na API.",
    });
}
