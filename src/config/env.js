import 'dotenv/config';
export function validarConfiguracao() {
  for (const nome of ['DB_HOST', 'DB_USER', 'DB_NAME', 'DB_PORT']) {
    if (!process.env[nome]?.trim()) throw new Error('Configuração obrigatória ausente: ' + nome);
  }
  for (const nome of ['DB_PORT', 'PORT']) {
    if (process.env[nome] !== undefined && (!/^\d+$/.test(process.env[nome]) || Number(process.env[nome]) < 1 || Number(process.env[nome]) > 65535)) throw new Error('Porta inválida: ' + nome);
  }
}
