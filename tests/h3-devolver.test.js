import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';
import { PADARIA, publicar, aceitar } from './apoio.js';

const app = criarApp();

beforeEach(async () => {
  await migrar();
  await limparBanco();
});

afterAll(async () => {
  await encerrar();
});

const devolver = (id, ong = 'Casa Esperança', motivo = 'sem voluntário hoje') =>
  request(app).post(`/api/doacoes/${id}/devolver`).send({ ong, motivo });

async function daPadaria() {
  const resposta = await request(app).get('/api/minhas-doacoes').query({ doador: PADARIA });
  return resposta.body;
}

describe('H3: a ONG devolve uma doação aceita', () => {
  it('H3-CA1: a doação devolvida volta para as disponíveis, sem ONG, e o motivo fica registrado', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');

    const resposta = await devolver(doacao.id, 'Casa Esperança', 'sem voluntário hoje');

    expect(resposta.status).toBe(200);
    const disponiveis = await request(app).get('/api/doacoes');
    expect(disponiveis.body).toHaveLength(1);
    expect(disponiveis.body[0]).toMatchObject({ id: doacao.id, status: 'disponivel', ong: null });
    // O motivo é para o doador; a lista aberta às ONGs não o mostra.
    expect(disponiveis.body[0]).not.toHaveProperty('motivo_devolucao');
    expect((await daPadaria())[0]).toMatchObject({ motivo_devolucao: 'sem voluntário hoje' });
  });

  it('H3-CA2: recusa devolver uma doação já coletada, que continua coletada', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');
    await request(app).post(`/api/doacoes/${doacao.id}/coletar`).send({ voluntario: 'Rui', versaoAceite: 1 });

    const resposta = await devolver(doacao.id);

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('doação já coletada não pode ser devolvida');
    expect((await daPadaria())[0]).toMatchObject({
      status: 'coletada', ong: 'Casa Esperança', voluntario: 'Rui', motivo_devolucao: null
    });
  });

  it('H3-CA3: recusa a devolução por outra ONG, e a doação continua aceita pela Casa Esperança', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');

    const resposta = await devolver(doacao.id, 'Outra ONG', 'não é nossa');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('só a ONG que aceitou pode devolver a doação');
    expect((await daPadaria())[0]).toMatchObject({
      status: 'aceita', ong: 'Casa Esperança', motivo_devolucao: null
    });
  });

  it('H3 (decisão): recusa a devolução sem motivo, e a doação continua aceita', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');

    const resposta = await devolver(doacao.id, 'Casa Esperança', '   ');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('motivo é obrigatório');
    expect((await daPadaria())[0]).toMatchObject({ status: 'aceita', ong: 'Casa Esperança' });
  });

  it('H3 (limite): recusa a devolução sem identificar a ONG', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');

    const resposta = await request(app)
      .post(`/api/doacoes/${doacao.id}/devolver`)
      .send({ motivo: 'sem voluntário hoje' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('ong é obrigatório');
  });

  it('H3 (limite): recusa devolver de novo uma doação que já voltou para a lista', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');
    await devolver(doacao.id);

    const segunda = await devolver(doacao.id, 'Casa Esperança', 'outro motivo');

    expect(segunda.status).toBe(400);
    expect(segunda.body.erro).toBe('só uma doação aceita pode ser devolvida');
    expect((await daPadaria())[0]).toMatchObject({ motivo_devolucao: 'sem voluntário hoje' });
  });

  it('H3 (decisão): a ONG que devolveu pode aceitar a mesma doação de novo, e a resposta não traz o motivo', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');
    await devolver(doacao.id);

    const denovo = await aceitar(app, doacao.id, 'Casa Esperança');

    expect(denovo).toMatchObject({ status: 'aceita', ong: 'Casa Esperança' });
    expect(denovo).not.toHaveProperty('motivo_devolucao');
  });

  it('H3 (decisão): o nome da ONG é comparado sem diferenciar maiúsculas', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');

    const resposta = await devolver(doacao.id, ' casa ESPERANÇA ');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ status: 'disponivel', ong: null });
  });
});
