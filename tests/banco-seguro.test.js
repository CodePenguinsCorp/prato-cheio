import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');

describe('isolamento do banco de testes', () => {
  it('recusa limpeza de arquivo e ignora DATABASE_FILE durante os testes', () => {
    expect(process.env.VITEST).toBe('true');
    const diretorio = mkdtempSync(join(tmpdir(), 'prato-cheio-teste-'));
    const arquivo = join(diretorio, 'piloto.sqlite');
    const banco = new DatabaseSync(arquivo);
    banco.exec("CREATE TABLE doacoes (id INTEGER PRIMARY KEY, tipo TEXT); INSERT INTO doacoes (tipo) VALUES ('Doação real')");
    banco.close();

    const codigo = `
      import { migrar, limparBanco, query, encerrar } from './src/db.js';
      if (process.env.VITEST === 'true') {
        await migrar();
        await query("INSERT INTO doacoes (tipo, quantidade, validade) VALUES (?, ?, ?)", ['Teste', '1', '2026-10-21']);
        await limparBanco();
        const { rows } = await query('SELECT COUNT(*) AS total FROM doacoes');
        if (rows[0].total !== 0) process.exitCode = 2;
      } else {
        try {
          await limparBanco();
          process.exitCode = 3;
        } catch (erro) {
          if (!erro.message.includes('banco em memória')) process.exitCode = 4;
        }
      }
      await encerrar();
    `;

    try {
      for (const vitest of ['', 'true']) {
        const resultado = spawnSync(process.execPath, ['--no-warnings=ExperimentalWarning', '--input-type=module', '-e', codigo], {
          cwd: process.cwd(),
          encoding: 'utf8',
          env: { ...process.env, VITEST: vitest, DATABASE_FILE: arquivo }
        });
        expect(resultado.status, resultado.stderr || resultado.stdout).toBe(0);

        const verificacao = new DatabaseSync(arquivo);
        expect(verificacao.prepare('SELECT tipo FROM doacoes').all()).toEqual([{ tipo: 'Doação real' }]);
        verificacao.close();
      }
    } finally {
      unlinkSync(arquivo);
      rmdirSync(diretorio);
    }
  });
});
