// Camada de dados do Prato Cheio — acesso ao banco.
// A conexão e o schema já estão prontos em src/db.js.
//
// Marcador de parâmetro é `$1`, `$2`, … (SQL parametrizado evita injeção):
//   const { rows } = await query('SELECT * FROM doacoes WHERE id = $1', [id]);
import { query } from './db.js';

// Colunas das respostas gerais. O motivo da devolução fica de fora: só a
// consulta do doador o devolve.
const COLUNAS = 'id, tipo, quantidade, validade, status, ong, criada_em, doador, voluntario, coletada_em';

export async function inserir({ tipo, quantidade, validade, doador, criadaEm }) {
  const { rows } = await query(
    `INSERT INTO doacoes (tipo, quantidade, validade, doador, criada_em)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUNAS}`,
    [tipo, quantidade, validade, doador, criadaEm]
  );
  return rows[0];
}

export async function listarDisponiveis() {
  const { rows } = await query(
    `SELECT ${COLUNAS}
       FROM doacoes
      WHERE status = $1
      ORDER BY criada_em ASC, id ASC`,
    ['disponivel']
  );
  return rows;
}

// Compara o nome sem diferenciar maiúsculas. Doações antigas (doador NULL)
// nunca casam, então não aparecem na consulta de ninguém.
export async function listarPorDoador(doador) {
  const { rows } = await query(
    `SELECT *
       FROM doacoes
      WHERE lower(doador) = lower($1)
      ORDER BY criada_em ASC, id ASC`,
    [doador]
  );
  return rows;
}

export async function listarPorOng(ong) {
  const { rows } = await query(
    `SELECT ${COLUNAS}
       FROM doacoes
      WHERE lower(ong) = lower($1)
      ORDER BY criada_em ASC, id ASC`,
    [ong]
  );
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await query(
    'SELECT * FROM doacoes WHERE id = $1',
    [id]
  );
  return rows[0];
}

export async function aceitar(id, ong) {
  const { rows } = await query(
    `UPDATE doacoes
        SET status = 'aceita', ong = $1
      WHERE id = $2 AND status = 'disponivel'
      RETURNING ${COLUNAS}`,
    [ong, id]
  );
  return rows[0];
}

// A condição no status garante que só uma confirmação vale, mesmo simultâneas.
export async function confirmarColeta(id, voluntario, coletadaEm) {
  const { rows } = await query(
    `UPDATE doacoes
        SET status = 'coletada', voluntario = $1, coletada_em = $2
      WHERE id = $3 AND status = 'aceita'
      RETURNING ${COLUNAS}`,
    [voluntario, coletadaEm, id]
  );
  return rows[0];
}

// Devolver desfaz o aceite: a doação volta para a lista sem rastro da ONG.
export async function devolver(id, ong, motivo) {
  const { rows } = await query(
    `UPDATE doacoes
        SET status = 'disponivel', ong = NULL, voluntario = NULL, coletada_em = NULL, motivo_devolucao = $1
      WHERE id = $2 AND status = 'aceita' AND ong = $3
      RETURNING ${COLUNAS}`,
    [motivo, id, ong]
  );
  return rows[0];
}
