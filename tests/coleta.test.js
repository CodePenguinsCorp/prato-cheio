import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar } from '../src/db.js';

const app = criarApp();
const oferta = { doador: 'Padaria Pão Bom', tipo: 'Pães', quantidade: '20 unidades', validade: '2027-01-20' };
beforeEach(async () => { await migrar(); await limparBanco(); });
afterAll(encerrar);
async function publicar(aceitar = true) {
  const { body } = await request(app).post('/api/doacoes').send(oferta).expect(201);
  if (aceitar) await request(app).post(`/api/doacoes/${body.id}/aceitar`).send({ ong: 'Casa Esperança' }).expect(200);
  return body;
}
const coletar = (id, voluntario = 'Rui') => request(app).post(`/api/doacoes/${id}/coletar`).send({ voluntario });

describe('H2 — o voluntário confirma a coleta', () => {
  it('H2-CA1: registra coleta de doação aceita com voluntário e horário do servidor', async () => {
    // Dado: uma doação aceita pela Casa Esperança.
    const doacao = await publicar();
    const antes = Date.now();
    // Quando: Rui confirma a coleta.
    const resposta = await coletar(doacao.id);
    // Então: estado e identificação registrados; horário não vem do cliente.
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ id: doacao.id, status: 'coletada', ong: 'Casa Esperança', voluntario: 'Rui' });
    expect(Date.parse(resposta.body.coletada_em)).toBeGreaterThanOrEqual(antes - 1000);
    expect(Date.parse(resposta.body.coletada_em)).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('H2-CA2: recusa coletar doação disponível sem alterar seu estado', async () => {
    // Dado: a oferta ainda não foi aceita.
    const doacao = await publicar(false);
    // Quando: alguém tenta confirmar a coleta.
    const resposta = await coletar(doacao.id);
    // Então: recusa clara e estado original preservado.
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('somente doação aceita pode ser coletada');
    const consulta = await request(app).get('/api/doacoes/doador').query({ nome: oferta.doador });
    expect(consulta.body[0]).toMatchObject({ status: 'disponivel', ong: null, voluntario: null, coletada_em: null });
  });

  it('H2-CA3: apresenta a doação coletada na consulta do doador', async () => {
    // Dado: a oferta foi aceita e coletada pela API.
    const doacao = await publicar();
    await coletar(doacao.id).expect(200);
    // Quando: o doador consulta as suas ofertas.
    const resposta = await request(app).get('/api/doacoes/doador').query({ nome: oferta.doador });
    // Então: a coleta aparece com seu estado final.
    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0]).toMatchObject({ id: doacao.id, status: 'coletada' });
  });

  it('H2-L1: recusa coleta repetida e preserva quem coletou primeiro', async () => {
    const doacao = await publicar();
    const primeira = await coletar(doacao.id).expect(200);
    const repetida = await coletar(doacao.id, 'Outra pessoa');
    expect(repetida.status).toBe(400);
    expect(repetida.body.erro).toBe('somente doação aceita pode ser coletada');
    const consulta = await request(app).get('/api/doacoes/doador').query({ nome: oferta.doador });
    expect(consulta.body[0].voluntario).toBe('Rui');
    expect(consulta.body[0].coletada_em).toBe(primeira.body.coletada_em);
  });

  it('H2-L2: recusa voluntário vazio e doação inexistente ou id inválido', async () => {
    const doacao = await publicar();
    const semNome = await coletar(doacao.id, '   ');
    expect(semNome.status).toBe(400);
    expect(semNome.body.erro).toBe('voluntário é obrigatório');
    const inexistente = await coletar(999999);
    expect(inexistente.status).toBe(400);
    expect(inexistente.body.erro).toBe('doação não encontrada');
    const invalido = await coletar('abc');
    expect(invalido.status).toBe(400);
    expect(invalido.body.erro).toBe('id da doação é inválido');
  });

  it('H2-L3: duas confirmações concorrentes têm um único vencedor', async () => {
    const doacao = await publicar();
    const respostas = await Promise.all([coletar(doacao.id, 'Rui'), coletar(doacao.id, 'Ana')]);
    expect(respostas.map(r => r.status).sort()).toEqual([200, 400]);
    const vencedora = respostas.find(r => r.status === 200).body;
    const consulta = await request(app).get('/api/doacoes/doador').query({ nome: oferta.doador });
    expect(consulta.body[0]).toMatchObject({ status: 'coletada', voluntario: vencedora.voluntario, coletada_em: vencedora.coletada_em });
  });

  it('H2-L4: a ONG consulta apenas as doações aceitas por ela', async () => {
    const doacao = await publicar();
    await publicar(false);
    const resposta = await request(app).get('/api/doacoes/ong').query({ nome: 'Casa Esperança' });
    expect(resposta.status).toBe(200);
    expect(resposta.body.map(d => d.id)).toEqual([doacao.id]);
    const outra = await request(app).get('/api/doacoes/ong').query({ nome: 'Outra ONG' });
    expect(outra.body).toEqual([]);
  });
});
