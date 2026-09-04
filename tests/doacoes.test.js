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
      .send({ tipo: 'Sopa', quantidade: '10 porções', validade: '2026-09-04' });

    expect(publicada.status).toBe(201);

    const res = await request(app).get('/api/doacoes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      tipo: 'Sopa',
      quantidade: '10 porções',
      validade: '2026-09-04',
      status: 'disponivel'
    });
  });

  it('recusa doação sem os campos obrigatórios', async () => {
    const casos = [
      { quantidade: '10 porções', validade: '2026-09-04' },
      { tipo: 'Sopa', validade: '2026-09-04' },
      { tipo: 'Sopa', quantidade: '10 porções' }
    ];

    for (const doacao of casos) {
      const res = await request(app).post('/api/doacoes').send(doacao);
      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/é obrigatório$/);
    }

    const disponiveis = await request(app).get('/api/doacoes');
    expect(disponiveis.body).toEqual([]);
  });
});

describe('aceitar uma doação', () => {
  async function publicar() {
    const res = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Pães', quantidade: '20 unidades', validade: '2026-09-04' });
    return res.body;
  }

  it('marca a doação como aceita pela ONG', async () => {
    const doacao = await publicar();

    const res = await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Cozinha Solidária' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
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

    const res = await request(app).get('/api/doacoes');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('recusa aceitar uma doação que já foi aceita por outra ONG', async () => {
    const doacao = await publicar();
    await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Primeira ONG' });

    const res = await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Segunda ONG' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('doação já foi aceita');
  });
});
