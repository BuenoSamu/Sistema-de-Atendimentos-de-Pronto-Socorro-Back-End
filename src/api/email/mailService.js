import { readFile } from "fs/promises";
import { resolve } from "path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Envia email genérico.
 */
export async function sendEmail(subject, body, recipient) {
  console.log("Enviando e-mail para:", recipient);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipient,
    subject,
    text: "Este e-mail contém conteúdo em HTML.",
    html: body,

    attachments: [
      {
        filename: "Vihva-Logo.png",
        path: resolve("./src/assets/media/Vihva-Logo.png"),
        cid: "vihva-logo",
      },
    ],
  });

  console.log("E-mail enviado com sucesso!");
  console.log("Message ID:", info.messageId);
  console.log("Resposta SMTP:", info.response);
  console.log("Aceito:", info.accepted);
  console.log("Rejeitado:", info.rejected);

  return info;
}

/**
 * Template de cadastro.
 */
export async function emailCadastro(link) {
  const template = await readFile(
    "./src/templates/emailCadastro.html",
    "utf-8",
  );

  return template.replaceAll("{{LINK}}", link);
}

/**
 * Template de boas-vindas.
 */
export async function emailBoasVindas(link) {
  const template = await readFile(
    "./src/templates/emailBoasVindas.html",
    "utf-8",
  );

  return template.replaceAll("{{LINK}}", link);
}

/**
 * Template de recuperação de senha.
 */
export async function emailRecuperarSenha(link) {
  const template = await readFile(
    "./src/templates/emailRecuperarSenha.html",
    "utf-8",
  );

  return template.replaceAll("{{LINK}}", link);
}
