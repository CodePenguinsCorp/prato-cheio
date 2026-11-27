import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';
import { publicar, aceitar } from './apoio.js';

// Todas as datas vêm deste relógio: o resultado não depende do dia em que a suíte roda.
// Os horários são escritos no fuso de São Paulo (-03:00), o mesmo que define o mês.
let agora;
const app = criarApp({ relogio: () => agora });

beforeEach(async () => {
  await migrar();
  await limparBanco();
});

afterAll(async () => {
  await encerrar();
});

async function publicarEm(instante) {
  agora = new Date(instante);
  return publicar(app);
}

async function coletarEm(id, instante) {
  agora = new Date(instante);
  const resposta = await request(app).post(`/api/doacoes/${id}/coletar`).send({ voluntario: 'Rui', versaoAceite: 1 });
  expect(resposta.status).toBe(200);
}

const resultado = (mes) => request(app).get('/api/resultado').query({ mes });

describe('H4: a Marta vê o resultado do mês', () => {
  it('H4-CA1: em novembro, 3 publicadas, 2 aceitas, 1 coletada e tempo médio de 5 h', async () => {
    const primeira = await publicarEm('2026-11-10T08:00:00-03:00');
    const segunda = await publicarEm('2026-11-11T08:00:00-03:00');
    await publicarEm('2026-11-12T08:00:00-03:00');
    await aceitar(app, primeira.id);
    await aceitar(app, segunda.id);
    await coletarEm(primeira.id, '2026-11-10T13:00:00-03:00');

    const resposta = await resultado('2026-11');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      mes: '2026-11', publicadas: 3, aceitas: 2, coletadas: 1, tempoMedioHoras: 5, tempoMedio: '5 h'
    });
  });

  it('H4-CA2: mês sem coleta mostra "sem coletas no mês", nem zero nem erro', async () => {
    const doacao = await publicarEm('2026-11-10T08:00:00-03:00');
    await aceitar(app, doacao.id);

    const resposta = await resultado('2026-11');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      mes: '2026-11', publicadas: 1, aceitas: 1, coletadas: 0,
      tempoMedioHoras: null, tempoMedio: 'sem coletas no mês'
    });
  });

  it('H4-CA3: publicada em 31/10 e coletada em 01/11 conta em outubro, o mês da publicação', async () => {
    const doacao = await publicarEm('2026-10-31T20:00:00-03:00');
    await aceitar(app, doacao.id);
    await coletarEm(doacao.id, '2026-11-01T08:00:00-03:00');

    const novembro = await resultado('2026-11');
    const outubro = await resultado('2026-10');

    expect(novembro.body).toMatchObject({ publicadas: 0, aceitas: 0, coletadas: 0, tempoMedio: 'sem coletas no mês' });
    expect(outubro.body).toMatchObject({ publicadas: 1, aceitas: 1, coletadas: 1, tempoMedioHoras: 12 });
  });

  it('H4 (limite): o mês vira à meia-noite de São Paulo, não à meia-noite UTC', async () => {
    await publicarEm('2026-10-31T23:59:59-03:00'); // já é 01/11 em UTC
    await publicarEm('2026-11-01T00:00:00-03:00');
    await publicarEm('2026-11-30T23:59:59-03:00'); // já é 01/12 em UTC
    await publicarEm('2026-12-01T00:00:00-03:00');

    expect((await resultado('2026-10')).body.publicadas).toBe(1);
    expect((await resultado('2026-11')).body.publicadas).toBe(2);
    expect((await resultado('2026-12')).body.publicadas).toBe(1);
  });

  it('H4 (decisão): o tempo médio sai em horas com uma casa decimal', async () => {
    const primeira = await publicarEm('2026-11-10T08:00:00-03:00');
    const segunda = await publicarEm('2026-11-11T08:00:00-03:00');
    await aceitar(app, primeira.id);
    await aceitar(app, segunda.id);
    await coletarEm(primeira.id, '2026-11-10T13:00:00-03:00'); // 5 h
    await coletarEm(segunda.id, '2026-11-11T10:30:00-03:00'); // 2 h 30 min

    const resposta = await resultado('2026-11');

    // (5 + 2,5) / 2 = 3,75, que arredonda para 3,8
    expect(resposta.body).toMatchObject({ coletadas: 2, tempoMedioHoras: 3.8, tempoMedio: '3,8 h' });
  });

  it('H4 (decisão): a doação devolvida conta como publicada, mas não como aceita', async () => {
    const doacao = await publicarEm('2026-11-10T08:00:00-03:00');
    await aceitar(app, doacao.id, 'Casa Esperança');
    await request(app)
      .post(`/api/doacoes/${doacao.id}/devolver`)
      .send({ ong: 'Casa Esperança', motivo: 'sem voluntário hoje' });

    const resposta = await resultado('2026-11');

    expect(resposta.body).toMatchObject({ publicadas: 1, aceitas: 0, coletadas: 0 });
  });

  it.each([undefined, 'novembro', '2026-13', '2026-1'])(
    'H4 (limite): recusa o mês inválido %s com mensagem',
    async (mes) => {
      const resposta = await resultado(mes);

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('mes deve estar no formato AAAA-MM');
    }
  );
});
