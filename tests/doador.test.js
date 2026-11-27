import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, encerrar, query } from '../src/db.js';

const app = criarApp();
const oferta = { tipo: 'Pães', quantidade: '20 unidades', validade: '2027-01-20' };
beforeEach(async () => { await migrar(); await limparBanco(); });
afterAll(encerrar);

describe('H1 — o doador acompanha as suas doações', () => {
  async function publicar(doador = 'Padaria Pão Bom') {
    const resposta = await request(app).post('/api/doacoes').send({ ...oferta, doador });
    expect(resposta.status).toBe(201);
    return resposta.body;
  }
  it('H1-F1: registra o doador informado na publicação', async () => {
    // Dado e Quando: publicação pela API com a identificação do doador.
    const resposta = await request(app).post('/api/doacoes')
      .send({ ...oferta, doador: 'Padaria Pão Bom' });
    // Então: a identidade faz parte da doação persistida e devolvida.
    expect(resposta.status).toBe(201);
    expect(resposta.body).toMatchObject({ doador: 'Padaria Pão Bom', status: 'disponivel' });
  });

  it('H1-CA1: mostra as duas doações da padaria e a ONG que aceitou uma delas', async () => {
    // Dado: a padaria publicou duas ofertas, uma delas aceita pela Casa Esperança.
    const primeira = await publicar();
    const segunda = await publicar();
    await request(app).post(`/api/doacoes/${segunda.id}/aceitar`).send({ ong: 'Casa Esperança' }).expect(200);
    // Quando: consulta as próprias doações.
    const resposta = await request(app).get('/api/doacoes/doador').query({ nome: 'Padaria Pão Bom' });
    // Então: vê as duas situações e a ONG responsável.
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject([
      { id: primeira.id, status: 'disponivel', ong: null },
      { id: segunda.id, status: 'aceita', ong: 'Casa Esperança' }
    ]);
  });

  it('H1-CA2: não inclui doações de outro doador', async () => {
    // Dado: dois doadores publicaram ofertas.
    const minha = await publicar();
    await publicar('Mercado Vizinho');
    // Quando: a padaria consulta as suas.
    const resposta = await request(app).get('/api/doacoes/doador').query({ nome: 'Padaria Pão Bom' });
    // Então: somente a oferta dela é retornada.
    expect(resposta.status).toBe(200);
    expect(resposta.body.map(d => d.id)).toEqual([minha.id]);
  });

  it('H1-CA3: recusa publicação sem doador e não grava nada', async () => {
    // Dado e Quando: publicação sem a identificação exigida.
    const resposta = await request(app).post('/api/doacoes').send(oferta);
    // Então: mensagem clara e ausência de efeitos.
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('doador é obrigatório');
    expect((await request(app).get('/api/doacoes')).body).toEqual([]);
  });

  it('H1-L1: recusa nome em branco ou de tipo inválido na publicação', async () => {
    for (const doador of ['   ', 42, { nome: 'Padaria' }]) {
      const resposta = await request(app).post('/api/doacoes').send({ ...oferta, doador });
      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('doador é obrigatório');
    }
    expect((await request(app).get('/api/doacoes')).body).toEqual([]);
  });

  it('H1-L2: consulta sem nome é recusada e um doador sem ofertas recebe lista vazia', async () => {
    const semNome = await request(app).get('/api/doacoes/doador');
    expect(semNome.status).toBe(400);
    expect(semNome.body.erro).toBe('doador é obrigatório');
    const vazia = await request(app).get('/api/doacoes/doador').query({ nome: 'Sem ofertas' });
    expect(vazia.status).toBe(200);
    expect(vazia.body).toEqual([]);
  });

  it('H1-L3: preserva doação antiga sem inventar doador e permite migrar novamente', async () => {
    // A inserção direta simula o schema legado, anterior à história H1.
    await query('INSERT INTO doacoes (tipo, quantidade, validade) VALUES ($1,$2,$3)', ['Legado', '1 caixa', '2027-01-20']);
    await migrar();
    const minha = await publicar('  Padaria Pão Bom  ');
    const resposta = await request(app).get('/api/doacoes/doador').query({ nome: '  Padaria Pão Bom  ' });
    expect(resposta.status).toBe(200);
    expect(resposta.body.map(d => d.id)).toEqual([minha.id]);
    expect(resposta.body[0].doador).toBe('Padaria Pão Bom');
    const disponiveis = await request(app).get('/api/doacoes');
    expect(disponiveis.body).toHaveLength(2);
    expect(disponiveis.body.find(d => d.tipo === 'Legado').doador).toBeNull();
  });
});
