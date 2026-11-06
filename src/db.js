// Conexão com o banco PostgreSQL e isolamento da suíte de testes.
//
// A interface pública (`query` devolvendo `{ rows }`) é a mesma da época do SQLite:
// a troca de banco fica contida aqui e em src/repositorio.js (ver ADR 0004).
import pg from 'pg';

const EM_TESTE = process.env.VITEST === 'true';

// Durante o Vitest a conexão vem de TEST_DATABASE_URL. DATABASE_URL só vale no CI,
// onde o serviço PostgreSQL é descartável. Assim, `npm test` numa máquina com
// DATABASE_URL apontando para o banco do piloto nunca limpa esse banco.
function resolverUrl() {
  if (EM_TESTE) {
    return process.env.TEST_DATABASE_URL
      || (process.env.CI === 'true' ? process.env.DATABASE_URL : undefined);
  }
  return process.env.DATABASE_URL;
}

let pool;

export function conexao() {
  if (!pool) {
    const url = resolverUrl();
    if (!url) {
      throw new Error(EM_TESTE
        ? 'defina TEST_DATABASE_URL (banco descartável) para rodar os testes'
        : 'defina DATABASE_URL para conectar ao PostgreSQL');
    }
    pool = new pg.Pool({ connectionString: url });
  }
  return pool;
}

/**
 * Executa uma consulta e devolve { rows }.
 * Use $1, $2, … como marcadores de parâmetro (evita injeção de SQL):
 *   query('SELECT * FROM doacoes WHERE id = $1', [id])
 */
export async function query(sql, valores = []) {
  const { rows } = await conexao().query(sql, valores);
  return { rows };
}

/** Cria o schema, se ainda não existir. Rodado por `npm run db:migrar` e ao subir o servidor. */
export async function migrar() {
  await conexao().query(`
    CREATE TABLE IF NOT EXISTS doacoes (
      id          SERIAL PRIMARY KEY,
      tipo        TEXT NOT NULL,
      quantidade  TEXT NOT NULL,
      validade    TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'disponivel',
      ong         TEXT,
      criada_em   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

/** Apaga os dados apenas do banco descartável usado pelos testes. */
export async function limparBanco() {
  if (!EM_TESTE) {
    throw new Error('limparBanco só pode ser usado pela suíte de testes (banco descartável)');
  }
  await conexao().query('TRUNCATE doacoes RESTART IDENTITY');
}

export async function encerrar() {
  if (pool) { await pool.end(); pool = undefined; }
}
