// Regras de negócio das doações.
import * as repo from './repositorio.js';

function exigirTexto(valor, campo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new Error(`${campo} é obrigatório`);
  }
  return valor.trim();
}

function exigirId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) throw new Error('id da doação é inválido');
  return numero;
}

async function exigirEstado(id, estado, mensagem) {
  const doacao = await repo.buscarPorId(id);
  if (!doacao) throw new Error('doação não encontrada');
  if (doacao.status !== estado) throw new Error(mensagem);
  return doacao;
}

function exigirInicio(valor, campo, padrao, descricao) {
  const texto = exigirTexto(valor, campo);
  if (!padrao.test(texto)) {
    throw new Error(`${campo} deve começar com ${descricao}`);
  }
  return texto;
}

function exigirDataIso(valor, campo) {
  const texto = exigirTexto(valor, campo);
  const correspondencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);

  if (!correspondencia) {
    throw new Error(`${campo} deve estar no formato AAAA-MM-DD`);
  }

  const [, ano, mes, dia] = correspondencia.map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  const ehDataReal = data.getUTCFullYear() === ano
    && data.getUTCMonth() === mes - 1
    && data.getUTCDate() === dia;

  if (!ehDataReal) {
    throw new Error(`${campo} deve ser uma data válida`);
  }

  return texto;
}

// História zero — "um doador publica uma doação".
// Critério: tipo, quantidade e validade são obrigatórios.
export async function criarDoacao({ tipo, quantidade, validade, doador } = {}) {
  return repo.inserir({
    tipo: exigirTexto(tipo, 'tipo'),
    quantidade: exigirTexto(quantidade, 'quantidade'),
    validade: exigirDataIso(validade, 'validade'),
    doador: exigirTexto(doador, 'doador')
  });
}

// História zero — "uma ONG vê as doações disponíveis".
export async function listarDisponiveis() {
  return repo.listarDisponiveis();
}

export async function listarDoDoador(nome) {
  return repo.listarDoDoador(exigirTexto(nome, 'doador'));
}

// História zero — "uma ONG aceita uma doação".
// Regra do caso: uma doação aceita não fica disponível para outra ONG.
export async function aceitar(id, ong) {
  const idNumerico = exigirId(id);

  const nomeOng = exigirInicio(ong, 'ong', /^[\p{L}\p{N}]/u, 'uma letra ou número');
  await exigirEstado(idNumerico, 'disponivel', 'doação já foi aceita');

  const aceita = await repo.aceitar(idNumerico, nomeOng);
  if (!aceita) throw new Error('doação já foi aceita por outra ONG');
  return aceita;
}

export async function listarDaOng(nome) {
  return repo.listarDaOng(exigirTexto(nome, 'ong'));
}

export async function coletar(id, voluntario) {
  const idNumerico = exigirId(id);
  const nome = exigirTexto(voluntario, 'voluntário');
  await exigirEstado(idNumerico, 'aceita', 'somente doação aceita pode ser coletada');
  const coletada = await repo.coletar(idNumerico, nome);
  if (!coletada) throw new Error('somente doação aceita pode ser coletada');
  return coletada;
}

export async function devolver(id, ong, motivo) {
  const idNumerico = exigirId(id);
  const nome = exigirTexto(ong, 'ong');
  const justificativa = exigirTexto(motivo, 'motivo');
  const doacao = await exigirEstado(idNumerico, 'aceita', 'somente doação aceita pode ser devolvida');
  if (doacao.ong !== nome) throw new Error('somente a ONG que aceitou pode devolver');
  const devolvida = await repo.devolver(idNumerico, nome, justificativa);
  if (!devolvida) throw new Error('a doação mudou; consulte a situação antes de devolver');
  return devolvida;
}
