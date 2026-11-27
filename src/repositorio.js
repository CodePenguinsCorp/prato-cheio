// Camada de dados do Prato Cheio — acesso ao banco.
// A conexão e o schema já estão prontos em src/db.js.
//
// Marcador de parâmetro é `$1`, `$2`, … (SQL parametrizado evita injeção):
//   const { rows } = await query('SELECT * FROM doacoes WHERE id = $1', [id]);
import { query } from './db.js';

export async function inserir({ tipo, quantidade, validade, doador, criadaEm }) {
  const { rows } = await query(
    `INSERT INTO doacoes (tipo, quantidade, validade, doador, criada_em)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [tipo, quantidade, validade, doador, criadaEm]
  );
  return rows[0];
}

export async function listarDisponiveis() {
  const { rows } = await query(
    `SELECT *
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
    `SELECT *
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
      RETURNING *`,
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
      RETURNING *`,
    [voluntario, coletadaEm, id]
  );
  return rows[0];
}
