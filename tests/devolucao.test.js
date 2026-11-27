import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';
const app = criarApp();
const oferta = { doador: 'Padaria Pão Bom', tipo: 'Pães', quantidade: '20 unidades', validade: '2027-01-20' };
beforeEach(async () => { await migrar(); await limparBanco(); });
afterAll(encerrar);
async function reservar() {
  const { body } = await request(app).post('/api/doacoes').send(oferta).expect(201);
  await request(app).post(`/api/doacoes/${body.id}/aceitar`).send({ ong: 'Casa Esperança' }).expect(200);
  return body;
}
describe('H3 — a ONG devolve uma doação aceita', () => {
  it('H3-CA1: devolve à lista sem ONG e preserva o motivo', async () => {
    // Dado: a Casa Esperança aceitou uma oferta.
    const doacao = await reservar();
    // Quando: devolve com um motivo.
    const resposta = await request(app).post(`/api/doacoes/${doacao.id}/devolver`)
      .send({ ong: 'Casa Esperança', motivo: 'sem voluntário hoje' });
    // Então: volta inteira à lista, sem a reserva anterior.
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ status: 'disponivel', ong: null, motivo_devolucao: 'sem voluntário hoje', voluntario: null, coletada_em: null });
    const disponiveis = await request(app).get('/api/doacoes');
    expect(disponiveis.body).toHaveLength(1);
    expect(disponiveis.body[0]).toMatchObject({ id: doacao.id, tipo: 'Pães', quantidade: '20 unidades', doador: oferta.doador, ong: null });
  });
});
