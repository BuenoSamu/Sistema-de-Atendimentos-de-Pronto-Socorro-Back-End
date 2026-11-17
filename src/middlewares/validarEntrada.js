import { HttpError } from '../utils/HttpError.js';
import { STATUS_ATENDIMENTO, CLASSIFICACOES_MANCHESTER } from '../config/dominio.js';

const campos = {
  pacientes: {
    nome_completo: 200, cpf: 11, rg: 20, data_nascimento: 'data',
    nome_pai: 200, nome_mae: 200, logradouro: 150, numero: 10,
    bairro: 100, cidade: 100, estado: 2, cep: 8,
  },
  atendimentos: { id_paciente: 'id', status: STATUS_ATENDIMENTO },
  triagens: {
    id_atendimento: 'id', pressao_sistolica: 'smallint',
    pressao_diastolica: 'smallint', temperatura: 'decimal',
    batimentos_cardiacos: 'smallint', queixas: 'texto',
    classificacao_manchester: CLASSIFICACOES_MANCHESTER,
  },
  consultas: { id_atendimento: 'id', observacoes: 'texto' },
};

const obrigatoriosNaoNulos = new Set([
  'nome_completo', 'data_nascimento', 'classificacao_manchester',
  'status',
]);

export function idValido(valor) {
  const tipoValido = typeof valor === 'number'
    || (typeof valor === 'string' && /^\d+$/.test(valor));
  return tipoValido && Number.isSafeInteger(Number(valor))
    && Number(valor) > 0 && Number(valor) <= 2147483647;
}

function dataValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  return Number(valor.slice(0, 4)) >= 1000 && !Number.isNaN(Date.parse(valor))
    && new Date(valor).toISOString().slice(0, 10) === valor;
}

function campoValido(campo, valor, regra) {
  if (valor === null && !obrigatoriosNaoNulos.has(campo) && !campo.startsWith('id_')) {
    return true;
  }
  if (typeof regra === 'number') {
    const exigeConteudo = ['nome_completo'].includes(campo);
    return typeof valor === 'string' && valor.length <= regra
      && (!exigeConteudo || Boolean(valor.trim()));
  }
  if (Array.isArray(regra)) {
    return typeof valor === 'string' && regra.includes(valor.toUpperCase());
  }
  switch (regra) {
    case 'id': return idValido(valor);
    case 'texto': return typeof valor === 'string' && Buffer.byteLength(valor) <= 65535;
    case 'smallint': return typeof valor === 'number' && Number.isInteger(valor) && valor >= 0 && valor <= 65535;
    case 'decimal': return typeof valor === 'number' && Number.isFinite(valor)
      && Math.abs(valor) <= 999.9 && Math.abs(valor * 10 - Math.round(valor * 10)) < 1e-8;
    case 'data': return dataValida(valor);
    default: return false;
  }
}

export function validarEntrada(req, res, next) {
  try {
    const modulo = req.baseUrl.split('/').at(-1);
    for (const [nome, valor] of Object.entries(req.query)) {
      if (typeof valor !== 'string') throw new HttpError(400, 'Filtro inválido: ' + nome);
      if (nome.startsWith('id_') && !idValido(valor)) throw new HttpError(400, 'ID inválido.');
    }
    for (const valor of Object.values(req.params)) {
      if (!idValido(valor)) throw new HttpError(400, 'ID inválido.');
    }
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new HttpError(400, 'Informe um objeto JSON.');
      }
      const regras = campos[modulo] || {};
      const permitidos = Object.keys(req.body).filter(campo => Object.hasOwn(regras, campo));
      if (!permitidos.length) throw new HttpError(400, 'Nenhum campo válido foi informado.');
      for (const campo of permitidos) {
        if (!campoValido(campo, req.body[campo], regras[campo])) {
          throw new HttpError(400, 'Campo inválido: ' + campo);
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
