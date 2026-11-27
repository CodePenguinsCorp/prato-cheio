import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';

const app = criarApp();
const oferta = { tipo: 'Pães', quantidade: '20 unidades', validade: '2027-01-20' };
beforeEach(async () => { await migrar(); await limparBanco(); });
afterAll(encerrar);

describe('H1 — o doador acompanha as suas doações', () => {
  it('H1-F1: registra o doador informado na publicação', async () => {
    // Dado e Quando: publicação pela API com a identificação do doador.
    const resposta = await request(app).post('/api/doacoes')
      .send({ ...oferta, doador: 'Padaria Pão Bom' });
    // Então: a identidade faz parte da doação persistida e devolvida.
    expect(resposta.status).toBe(201);
    expect(resposta.body).toMatchObject({ doador: 'Padaria Pão Bom', status: 'disponivel' });
  });
});
