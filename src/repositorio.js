// Camada de dados do Prato Cheio — acesso ao banco.
// A conexão e o schema já estão prontos em src/db.js.
//
// Marcador de parâmetro é `$1`, `$2`, … (SQL parametrizado evita injeção):
//   const { rows } = await query('SELECT * FROM doacoes WHERE id = $1', [id]);
import { query } from './db.js';

export async function inserir({ tipo, quantidade, validade, doador }) {
  const { rows } = await query(
    `INSERT INTO doacoes (tipo, quantidade, validade, doador)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tipo, quantidade, validade, doador]
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

export async function buscarPorId(id) {
  const { rows } = await query(
    'SELECT * FROM doacoes WHERE id = $1',
    [id]
  );
  return rows[0];
}

export async function listarDoDoador(doador) {
  const { rows } = await query(
    'SELECT * FROM doacoes WHERE doador = $1 ORDER BY criada_em ASC, id ASC',
    [doador]
  );
  return rows;
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

export async function listarDaOng(ong) {
  const { rows } = await query(
    'SELECT * FROM doacoes WHERE ong = $1 ORDER BY criada_em ASC, id ASC', [ong]
  );
  return rows;
}

export async function coletar(id, voluntario) {
  const { rows } = await query(
    `UPDATE doacoes SET status = 'coletada', voluntario = $1, coletada_em = clock_timestamp()
     WHERE id = $2 AND status = 'aceita' RETURNING *`, [voluntario, id]
  );
  return rows[0];
}

export async function devolver(id, ong, motivo) {
  const { rows } = await query(
    `UPDATE doacoes SET status = 'disponivel', ong = NULL, voluntario = NULL,
       coletada_em = NULL, motivo_devolucao = $1
     WHERE id = $2 AND status = 'aceita' AND ong = $3 RETURNING *`,
    [motivo, id, ong]
  );
  return rows[0];
}
