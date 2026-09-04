// Regras de negócio das doações.
import * as repo from './repositorio.js';

function exigirTexto(valor, campo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new Error(`${campo} é obrigatório`);
  }
  return valor.trim();
}

// História zero — "um doador publica uma doação".
// Critério: tipo, quantidade e validade são obrigatórios.
export async function criarDoacao({ tipo, quantidade, validade } = {}) {
  return repo.inserir({
    tipo: exigirTexto(tipo, 'tipo'),
    quantidade: exigirTexto(quantidade, 'quantidade'),
    validade: exigirTexto(validade, 'validade')
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

  const nomeOng = exigirTexto(ong, 'ong');
  const doacao = await repo.buscarPorId(idNumerico);

  if (!doacao) throw new Error('doação não encontrada');
  if (doacao.status !== 'disponivel') throw new Error('doação já foi aceita');

  const aceita = await repo.aceitar(idNumerico, nomeOng);
  if (!aceita) throw new Error('doação já foi aceita por outra ONG');
  return aceita;
}
