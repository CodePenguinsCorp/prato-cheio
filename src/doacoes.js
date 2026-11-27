// Regras de negócio das doações.
import * as repo from './repositorio.js';

function exigirTexto(valor, campo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new Error(`${campo} é obrigatório`);
  }
  return valor.trim();
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
// H1: o doador também é obrigatório, para poder acompanhar o que publicou.
export async function criarDoacao({ tipo, quantidade, validade, doador } = {}, agora = new Date()) {
  return repo.inserir({
    criadaEm: agora,
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

// H1 — "o doador acompanha as suas doações".
export async function listarDoDoador(doador) {
  return repo.listarPorDoador(exigirTexto(doador, 'doador'));
}

// A ONG precisa ver o que aceitou para saber o que falta buscar e o que chegou.
export async function listarDaOng(ong) {
  return repo.listarPorOng(exigirTexto(ong, 'ong'));
}

// História zero — "uma ONG aceita uma doação".
// Regra do caso: uma doação aceita não fica disponível para outra ONG.
export async function aceitar(id, ong) {
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    throw new Error('id da doação é inválido');
  }

  const nomeOng = exigirInicio(ong, 'ong', /^[\p{L}\p{N}]/u, 'uma letra ou número');
  const doacao = await repo.buscarPorId(idNumerico);

  if (!doacao) throw new Error('doação não encontrada');
  if (doacao.status !== 'disponivel') throw new Error('doação já foi aceita');

  const aceita = await repo.aceitar(idNumerico, nomeOng);
  if (!aceita) throw new Error('doação já foi aceita por outra ONG');
  return aceita;
}

// H2 — "o voluntário confirma a coleta".
export async function confirmarColeta(id, voluntario, agora = new Date()) {
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    throw new Error('id da doação é inválido');
  }

  const nome = exigirTexto(voluntario, 'voluntario');
  const doacao = await repo.buscarPorId(idNumerico);

  if (!doacao) throw new Error('doação não encontrada');
  if (doacao.status === 'coletada') throw new Error('a coleta desta doação já foi confirmada');
  if (doacao.status !== 'aceita') throw new Error('só uma doação aceita pode ter a coleta confirmada');

  const coletada = await repo.confirmarColeta(idNumerico, nome, agora);
  if (!coletada) throw new Error('a doação mudou de situação; atualize a página');
  return coletada;
}
