import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, query, encerrar } from '../src/db.js';

const app = criarApp();

beforeEach(async () => {
  await migrar();
  await limparBanco();
});

afterAll(async () => {
  await encerrar();
});

describe('H1: o doador acompanha as suas doações', () => {
  it('H1-CA3: recusa publicação sem doador, com mensagem, e não grava nada', async () => {
    const resposta = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Pães', quantidade: '20 unidades', validade: '2026-12-01' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('doador é obrigatório');

    const { rows } = await query('SELECT COUNT(*)::int AS total FROM doacoes');
    expect(rows[0].total).toBe(0);
  });

  it('H1 (schema): migrar acrescenta o doador sem apagar as doações já publicadas', async () => {
    // Recria a tabela como era antes de H1. Só acontece no banco descartável dos testes.
    await query('DROP TABLE doacoes');
    await query(`
      CREATE TABLE doacoes (
        id SERIAL PRIMARY KEY, tipo TEXT NOT NULL, quantidade TEXT NOT NULL, validade TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'disponivel', ong TEXT, criada_em TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    await query("INSERT INTO doacoes (tipo, quantidade, validade) VALUES ('Antiga', '1 caixa', '2026-12-01')");

    await migrar();

    const disponiveis = await request(app).get('/api/doacoes');
    expect(disponiveis.body).toHaveLength(1);
    expect(disponiveis.body[0]).toMatchObject({ tipo: 'Antiga', quantidade: '1 caixa', status: 'disponivel' });

    const { rows } = await query('SELECT doador FROM doacoes');
    expect(rows).toEqual([{ doador: null }]);
  });
});
