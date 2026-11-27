import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';
import { PADARIA, publicar, aceitar } from './apoio.js';

// Relógio controlado pelo teste: o horário conferido não depende do dia em que roda.
let agora;
const app = criarApp({ relogio: () => agora });

beforeEach(async () => {
  agora = new Date('2026-11-19T10:00:00Z');
  await migrar();
  await limparBanco();
});

afterAll(async () => {
  await encerrar();
});

const coletar = (id, voluntario) => request(app).post(`/api/doacoes/${id}/coletar`).send({ voluntario });

async function daPadaria() {
  const resposta = await request(app).get('/api/minhas-doacoes').query({ doador: PADARIA });
  return resposta.body;
}

describe('H2: o voluntário confirma a coleta', () => {
  it('H2-CA1: a doação aceita passa a coletada, com o nome do voluntário e o horário da coleta', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id, 'Casa Esperança');
    agora = new Date('2026-11-19T15:30:00Z');

    const resposta = await coletar(doacao.id, 'Rui');

    const coletada = {
      status: 'coletada',
      ong: 'Casa Esperança',
      voluntario: 'Rui',
      coletada_em: '2026-11-19T15:30:00.000Z'
    };
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject(coletada);
    expect((await daPadaria())[0]).toMatchObject(coletada);
  });

  it('H2-CA2: recusa confirmar a coleta de uma doação ainda disponível, que não muda', async () => {
    const doacao = await publicar(app);

    const resposta = await coletar(doacao.id, 'Rui');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('só uma doação aceita pode ter a coleta confirmada');
    expect((await daPadaria())[0]).toMatchObject({
      status: 'disponivel', ong: null, voluntario: null, coletada_em: null
    });
  });

  it('H2-CA3: depois da coleta, o doador vê a doação como coletada', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id);
    await coletar(doacao.id, 'Rui');

    expect((await daPadaria()).map(({ status }) => status)).toEqual(['coletada']);
  });

  it('H2 (limite): recusa confirmar duas vezes e mantém o primeiro voluntário e o primeiro horário', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id);
    await coletar(doacao.id, 'Rui');
    agora = new Date('2026-11-19T18:00:00Z');

    const segunda = await coletar(doacao.id, 'Ana');

    expect(segunda.status).toBe(400);
    expect(segunda.body.erro).toBe('a coleta desta doação já foi confirmada');
    expect((await daPadaria())[0]).toMatchObject({
      voluntario: 'Rui', coletada_em: '2026-11-19T10:00:00.000Z'
    });
  });

  it('H2 (decisão): recusa a confirmação sem o nome do voluntário', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id);

    const resposta = await coletar(doacao.id, '  ');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('voluntario é obrigatório');
    expect((await daPadaria())[0]).toMatchObject({ status: 'aceita', voluntario: null });
  });

  it('H2 (limite): recusa confirmar a coleta de uma doação que não existe', async () => {
    const resposta = await coletar(999, 'Rui');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('doação não encontrada');
  });

  it('H2 (tela da ONG): a ONG vê só as doações que aceitou, inclusive a já coletada', async () => {
    const paes = await publicar(app, { tipo: 'Pães' });
    const bolos = await publicar(app, { tipo: 'Bolos' });
    const sopa = await publicar(app, { tipo: 'Sopa' });
    await publicar(app, { tipo: 'Frutas' });
    await aceitar(app, paes.id, 'Casa Esperança');
    await aceitar(app, bolos.id, 'Casa Esperança');
    await aceitar(app, sopa.id, 'Outra ONG');
    await coletar(paes.id, 'Rui');

    const resposta = await request(app).get('/api/doacoes-da-ong').query({ ong: ' casa esperança ' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.map(({ tipo, status, voluntario }) => ({ tipo, status, voluntario }))).toEqual([
      { tipo: 'Pães', status: 'coletada', voluntario: 'Rui' },
      { tipo: 'Bolos', status: 'aceita', voluntario: null }
    ]);
  });

  it('H2 (limite): recusa a consulta da ONG sem o nome', async () => {
    const resposta = await request(app).get('/api/doacoes-da-ong');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('ong é obrigatório');
  });

  it('H2 (limite): duas confirmações ao mesmo tempo registram só uma', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id);

    const respostas = await Promise.all([coletar(doacao.id, 'Rui'), coletar(doacao.id, 'Ana')]);

    expect(respostas.map(({ status }) => status).sort()).toEqual([200, 400]);
  });
});
