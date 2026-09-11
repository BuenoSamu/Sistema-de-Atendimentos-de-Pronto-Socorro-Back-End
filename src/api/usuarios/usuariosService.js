import * as repo from "./usuariosRepository.js";
import * as tokenRepo from "../token/usuariosTokenRepository.js";
import { criarHash } from "../../utils/cript.js";
import { randomUUID } from "crypto";
import { sendEmail, emailCadastro } from "../email/mailService.js";

export async function getAll() {
  return await repo.findAll();
}

export async function create(data) {
  if (!data) {
    throw new Error("Dados do usuário são obrigatórios");
  }

  const camposObrigatorios = ["nome_completo", "email", "senha"];
  for (const campo of camposObrigatorios) {
    if (!data[campo]) {
      throw new Error(`${campo} é obrigatório`);
    }
  }

  const existente = await repo.findByEmail(data.email);
  if (existente) {
    throw new Error("Já existe usuário com esse email");
  }

  const senha_hash = await criarHash(data.senha);

  const novoUsuario = await repo.create({
    nome_completo: data.nome_completo,
    email: data.email,
    senha_hash,
  });

  const codigo_token = randomUUID();
  const validade_token = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await tokenRepo.createToken(
    novoUsuario.id_usuario,
    codigo_token,
    validade_token,
  );

  const link = `${process.env.APP_URL}/auth/confirmar-cadastro?token=${codigo_token}`;
  const html = await emailCadastro(link);

  await sendEmail("Confirme seu cadastro", html, novoUsuario.email);

  return {
    ...novoUsuario,
    mensagem: "Usuário criado com sucesso. Verifique seu email.",
  };
}

export async function confirmarCadastro(token) {
  if (!token) {
    throw new Error("Token não informado");
  }

  const registro = await tokenRepo.findByToken(token);

  if (!registro) {
    throw new Error("Token inválido");
  }

  if (registro.usado) {
    throw new Error("Token já utilizado");
  }

  if (new Date() > new Date(registro.validade_token)) {
    throw new Error("Token expirado");
  }

  await tokenRepo.markAsUsed(registro.id);

  return { mensagem: "Cadastro confirmado com sucesso" };
}
