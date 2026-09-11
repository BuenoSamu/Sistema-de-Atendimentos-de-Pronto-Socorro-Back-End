import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

/**
 * Gera hash da senha.
 */
export async function criarHash(senha) {
  return await bcrypt.hash(senha, 10);
}

/**
 * Compara senha informada com hash salvo.
 */
export async function compararHash(senhaDigitada, senhaHash) {
  return await bcrypt.compare(senhaDigitada, senhaHash);
}

/**
 * Gera JWT com dados seguros do usuário.
 */
export function gerarToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nome_completo: usuario.nome_completo,
      email: usuario.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
      jwtid: randomUUID(),
    },
  );
}

/**
 * Valida JWT.
 */
export function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
