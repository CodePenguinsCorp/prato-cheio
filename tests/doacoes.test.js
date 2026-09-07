import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';

const app = criarApp();

beforeEach(async () => {
  await migrar();
  await limparBanco();
});

afterAll(async () => {
  await encerrar();
});

// Este teste já passa e não depende do banco:
// prova que a aplicação sobe e que o CI está funcionando.
describe('a aplicação sobe', () => {
  it('responde na verificação de saúde', async () => {
    const res = await request(app).get('/api/saude');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('publicar e listar doações', () => {
  it('mostra a doação publicada na lista de disponíveis', async () => {
    const publicada = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: '2026-09-08' });

    expect(publicada.status).toBe(201);

    const disponiveis = await request(app).get('/api/doacoes');

    expect(disponiveis.status).toBe(200);
    expect(disponiveis.body).toHaveLength(1);
    expect(disponiveis.body[0]).toMatchObject({
      tipo: 'Sopa',
      quantidade: '10 porções',
      validade: '2026-09-08',
      status: 'disponivel'
    });
  });

  it.each([
    ['tipo', { quantidade: '10 porções', validade: '2026-09-08' }],
    ['quantidade', { tipo: 'Sopa', validade: '2026-09-08' }],
    ['validade', { tipo: 'Sopa', quantidade: '10 porções' }]
  ])('recusa doação sem o campo obrigatório %s', async (campo, doacao) => {
    const resposta = await request(app).post('/api/doacoes').send(doacao);

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe(`${campo} é obrigatório`);

    const disponiveis = await request(app).get('/api/doacoes');
    expect(disponiveis.body).toEqual([]);
  });
});

describe('aceitar uma doação', () => {
  async function publicar() {
    const resposta = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Pães', quantidade: '20 unidades', validade: '2026-09-08' });

    expect(resposta.status).toBe(201);
    return resposta.body;
  }

  it('marca a doação como aceita pela ONG', async () => {
    const doacao = await publicar();

    const resposta = await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Cozinha Solidária' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({
      id: doacao.id,
      status: 'aceita',
      ong: 'Cozinha Solidária'
    });
  });

  it('remove a doação da lista de disponíveis depois de aceita', async () => {
    const doacao = await publicar();
    await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Cozinha Solidária' });

    const disponiveis = await request(app).get('/api/doacoes');

    expect(disponiveis.status).toBe(200);
    expect(disponiveis.body).toEqual([]);
  });

  it('recusa aceitar uma doação que já foi aceita por outra ONG', async () => {
    const doacao = await publicar();
    await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Primeira ONG' });

    const segundaTentativa = await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Segunda ONG' });

    expect(segundaTentativa.status).toBe(400);
    expect(segundaTentativa.body.erro).toBe('doação já foi aceita');
  });

  it('permite somente um aceite quando duas ONGs tentam ao mesmo tempo', async () => {
    const doacao = await publicar();

    const respostas = await Promise.all([
      request(app).post(`/api/doacoes/${doacao.id}/aceitar`).send({ ong: 'ONG A' }),
      request(app).post(`/api/doacoes/${doacao.id}/aceitar`).send({ ong: 'ONG B' })
    ]);

    expect(respostas.map(({ status }) => status).sort()).toEqual([200, 400]);
  });
});
