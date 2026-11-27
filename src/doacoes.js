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

// Estados e transições (docs/projeto.md, D6): cada ação parte de um único estado.
// `recusas` traz a mensagem para cada um dos outros.
const TRANSICOES = {
  aceitar: {
    de: 'disponivel',
    recusas: {
      aceita: 'doação já foi aceita',
      coletada: 'doação já foi aceita'
    }
  },
  confirmarColeta: {
    de: 'aceita',
    recusas: {
      disponivel: 'só uma doação aceita pode ter a coleta confirmada',
      coletada: 'a coleta desta doação já foi confirmada'
    }
  },
  devolver: {
    de: 'aceita',
    recusas: {
      disponivel: 'só uma doação aceita pode ser devolvida',
      coletada: 'doação já coletada não pode ser devolvida'
    }
  }
};

function exigirId(id) {
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    throw new Error('id da doação é inválido');
  }
  return idNumerico;
}

// Começo comum das transições: busca a doação, recusa se ela não existe e
// confere se a transição é permitida a partir do estado atual.
async function buscarParaTransicao(id, transicao) {
  const doacao = await repo.buscarPorId(id);
  if (!doacao) throw new Error('doação não encontrada');
  if (doacao.status !== transicao.de) throw new Error(transicao.recusas[doacao.status]);
  return doacao;
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
  const idNumerico = exigirId(id);
  const nomeOng = exigirInicio(ong, 'ong', /^[\p{L}\p{N}]/u, 'uma letra ou número');
  await buscarParaTransicao(idNumerico, TRANSICOES.aceitar);

  const aceita = await repo.aceitar(idNumerico, nomeOng);
  if (!aceita) throw new Error('doação já foi aceita por outra ONG');
  return aceita;
}

// H2 — "o voluntário confirma a coleta".
export async function confirmarColeta(id, voluntario, agora = new Date()) {
  const idNumerico = exigirId(id);
  const nome = exigirTexto(voluntario, 'voluntario');
  await buscarParaTransicao(idNumerico, TRANSICOES.confirmarColeta);

  const coletada = await repo.confirmarColeta(idNumerico, nome, agora);
  if (!coletada) throw new Error('a doação mudou de situação; atualize a página');
  return coletada;
}

// H3 — "a ONG devolve uma doação aceita".
export async function devolver(id, { ong, motivo } = {}) {
  const idNumerico = exigirId(id);
  const nomeOng = exigirTexto(ong, 'ong');
  const texto = exigirTexto(motivo, 'motivo');
  const doacao = await buscarParaTransicao(idNumerico, TRANSICOES.devolver);

  if (doacao.ong.toLocaleLowerCase('pt-BR') !== nomeOng.toLocaleLowerCase('pt-BR')) {
    throw new Error('só a ONG que aceitou pode devolver a doação');
  }

  // O repositório recebe o nome como foi gravado, já conferido acima.
  const devolvida = await repo.devolver(idNumerico, doacao.ong, texto);
  if (!devolvida) throw new Error('a doação mudou de situação; atualize a página');
  return devolvida;
}
