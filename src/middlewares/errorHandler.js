export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500;
  let mensagem = err.message;
  if (err.code === 'ER_DUP_ENTRY') { status = 409; mensagem = 'Já existe um registro com estes dados únicos.'; }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') { status = 404; mensagem = 'Registro relacionado não encontrado.'; }
  if (['ER_BAD_NULL_ERROR', 'ER_DATA_TOO_LONG', 'ER_TRUNCATED_WRONG_VALUE', 'WARN_DATA_TRUNCATED', 'ER_WARN_DATA_OUT_OF_RANGE'].includes(err.code)) {
    status = 400; mensagem = 'Dados incompatíveis com os campos do cadastro.';
  }
  if (err.type === 'entity.parse.failed') { status = 400; mensagem = 'JSON inválido.'; }
  if (status >= 500) {
    console.error('Erro interno:', err.code || err.name);
    mensagem = 'Ocorreu um erro interno na API.';
  }
  return res.status(status).json({ mensagem });
}
