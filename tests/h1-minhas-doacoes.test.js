import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, query, encerrar } from '../src/db.js';
import { PADARIA, publicar, aceitar } from './apoio.js';

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

describe('H1: consulta das doações de um doador', () => {
  const consultar = (doador) => request(app).get('/api/minhas-doacoes').query({ doador });

  it('H1-CA1: a padaria vê as suas duas doações, uma disponível e outra aceita por Casa Esperança', async () => {
    const paes = await publicar(app, { tipo: 'Pães' });
    await publicar(app, { tipo: 'Bolos' });
    await aceitar(app, paes.id, 'Casa Esperança');

    const resposta = await consultar(PADARIA);

    expect(resposta.status).toBe(200);
    expect(resposta.body.map(({ tipo, status, ong }) => ({ tipo, status, ong }))).toEqual([
      { tipo: 'Pães', status: 'aceita', ong: 'Casa Esperança' },
      { tipo: 'Bolos', status: 'disponivel', ong: null }
    ]);
  });

  it('H1-CA2: a doação de outro doador não aparece para a padaria', async () => {
    await publicar(app, { tipo: 'Pães' });
    await publicar(app, { tipo: 'Marmitas', doador: 'Restaurante Sabor' });

    const resposta = await consultar(PADARIA);

    expect(resposta.status).toBe(200);
    expect(resposta.body.map(({ tipo }) => tipo)).toEqual(['Pães']);
  });

  it('H1 (limite): recusa a consulta sem informar o doador, em vez de listar tudo', async () => {
    await publicar(app);

    const resposta = await consultar('   ');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('doador é obrigatório');
  });

  it('H1 (decisão): o nome é comparado sem diferenciar maiúsculas nem espaços nas pontas', async () => {
    await publicar(app, { tipo: 'Pães' });

    const resposta = await consultar('  PADARIA PÃO BOM ');

    expect(resposta.body.map(({ tipo }) => tipo)).toEqual(['Pães']);
  });

  it('H1 (decisão): doação antiga, sem doador, continua disponível e não entra em consulta alguma', async () => {
    // Não dá para preparar pela API: hoje ela recusa publicar sem doador.
    await query("INSERT INTO doacoes (tipo, quantidade, validade) VALUES ('Antiga', '1 caixa', '2026-12-01')");

    const minhas = await consultar(PADARIA);
    const disponiveis = await request(app).get('/api/doacoes');

    expect(minhas.body).toEqual([]);
    expect(disponiveis.body.map(({ tipo }) => tipo)).toEqual(['Antiga']);
  });
});
