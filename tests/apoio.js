// Preparação do "Dado" pela API, compartilhada pelos testes das histórias.
import request from 'supertest';
import { expect } from 'vitest';

export const PADARIA = 'Padaria Pão Bom';

export async function publicar(app, dados = {}) {
  const resposta = await request(app)
    .post('/api/doacoes')
    .send({ tipo: 'Pães', quantidade: '20 unidades', validade: '2026-12-01', doador: PADARIA, ...dados });

  expect(resposta.status).toBe(201);
  return resposta.body;
}

export async function aceitar(app, id, ong = 'Casa Esperança') {
  const resposta = await request(app).post(`/api/doacoes/${id}/aceitar`).send({ ong });

  expect(resposta.status).toBe(200);
  return resposta.body;
}
