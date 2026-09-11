import * as usuariosRepo from "../usuarios/usuariosRepository.js";
import * as usuariosService from "../usuarios/usuariosService.js";
import { compararHash, gerarToken } from "../../utils/cript.js";

export async function login({ email, senha }) {
  if (!email || !senha) {
    throw new Error("Email e senha são obrigatórios");
  }

  const usuario = await usuariosRepo.findByEmail(email);

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  const senhaValida = await compararHash(senha, usuario.senha_hash);

  if (!senhaValida) {
    throw new Error("Senha inválida");
  }

  const token = gerarToken(usuario);

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nome_completo: usuario.nome_completo,
      email: usuario.email,
    },
  };
}

export async function confirmarCadastro(token) {
  return await usuariosService.confirmarCadastro(token);
}
