import { verificarToken } from "../utils/cript.js";

/**
 * Middleware para proteger rotas.
 * Exige Authorization: Bearer <token>
 */
export function autenticarJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ mensagem: "Token não informado." });
    }

    const [tipo, token] = authHeader.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({ mensagem: "Formato do token inválido." });
    }

    const dadosToken = verificarToken(token);
    req.usuario = dadosToken;

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
}
