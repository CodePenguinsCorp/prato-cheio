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
export async function criarDoacao({ tipo, quantidade, validade } = {}) {
  return repo.inserir({
    tipo: exigirTexto(tipo, 'tipo'),
    quantidade: exigirTexto(quantidade, 'quantidade'),
    validade: exigirDataIso(validade, 'validade')
  });
}

// História zero — "uma ONG vê as doações disponíveis".
export async function listarDisponiveis() {
  return repo.listarDisponiveis();
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
