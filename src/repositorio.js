// Camada de dados do Prato Cheio — acesso ao banco.
// A conexão e o schema já estão prontos em src/db.js.
//
// Marcador de parâmetro é `$1`, `$2`, … (SQL parametrizado evita injeção):
//   const { rows } = await query('SELECT * FROM doacoes WHERE id = $1', [id]);
import { query } from './db.js';

export async function inserir({ tipo, quantidade, validade }) {
  const { rows } = await query(
    `INSERT INTO doacoes (tipo, quantidade, validade)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [tipo, quantidade, validade]
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
