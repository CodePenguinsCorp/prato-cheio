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

  it('EX-05: serve a interface com CSS e JavaScript externos', async () => {
    const [pagina, estilos, scripts] = await Promise.all([
      request(app).get('/'),
      request(app).get('/custom.css'),
      request(app).get('/app.js')
    ]);

    expect(pagina.status).toBe(200);
    expect(pagina.text).toContain('href="/custom.css"');
    expect(pagina.text).toContain('src="/app.js" defer');
    expect(pagina.text).not.toContain('<style>');
    expect(pagina.text).not.toContain('<script>');
    expect(estilos.status).toBe(200);
    expect(estilos.headers['content-type']).toContain('text/css');
    expect(estilos.text).toContain(':root');
    expect(scripts.status).toBe(200);
    expect(scripts.headers['content-type']).toContain('javascript');
    expect(scripts.text).toContain("const form = document.getElementById('form-doacao')");
  });
});

describe('publicar e listar doações', () => {
<<<<<<< HEAD
  it('CA-01: mostra a doação publicada na lista de disponíveis', async () => {
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
  ])('CA-02: recusa doação sem o campo obrigatório %s', async (campo, doacao) => {
    const resposta = await request(app).post('/api/doacoes').send(doacao);

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe(`${campo} é obrigatório`);

    const disponiveis = await request(app).get('/api/doacoes');
    expect(disponiveis.body).toEqual([]);
  });

  it.each([
    ['amanhã', 'validade deve estar no formato AAAA-MM-DD'],
    ['2026-02-30', 'validade deve ser uma data válida']
  ])('EX-01: recusa validade inválida %s', async (validade, mensagem) => {
    const resposta = await request(app)
      .post('/api/doacoes')
      .send({ tipo: 'Frutas', quantidade: '6 caixas', validade });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe(mensagem);
  });
});

describe('aceitar uma doação', () => {
  async function publicar() {
    const resposta = await request(app)
=======
  it.todo('mostra a doação publicada na lista de disponíveis');
  it.todo('recusa doação sem os campos obrigatórios');
});

describe('aceitar uma doação', () => {
  it.todo('marca a doação como aceita pela ONG');
  it.todo('remove a doação da lista de disponíveis depois de aceita');
  it.todo('recusa aceitar uma doação que já foi aceita por outra ONG');
});

/* Exemplo de como transformar um critério de aceite em teste.
   Descomente o beforeEach/afterAll quando começar a usar o banco.

  beforeEach(async () => { await migrar(); await limparBanco(); });
  afterAll(async () => { await encerrar(); });

  Dado que um doador publicou uma doação
  Quando uma ONG consulta as doações disponíveis
  Então a doação aparece na lista

  it('mostra a doação publicada na lista de disponíveis', async () => {
    await request(app)
>>>>>>> be67081 (docs(analise): consolida regras, histórias e docs.)
      .post('/api/doacoes')
      .send({ tipo: 'Pães', quantidade: '20 unidades', validade: '2026-09-08' });

    expect(resposta.status).toBe(201);
    return resposta.body;
  }

  it('CA-03: marca a doação como aceita pela ONG', async () => {
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

  it('CA-04: remove a doação da lista de disponíveis depois de aceita', async () => {
    const doacao = await publicar();
    await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: 'Cozinha Solidária' });

    const disponiveis = await request(app).get('/api/doacoes');

    expect(disponiveis.status).toBe(200);
    expect(disponiveis.body).toEqual([]);
  });

  it('CA-05: recusa aceitar uma doação que já foi aceita por outra ONG', async () => {
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

  it('EX-02: permite somente um aceite quando duas ONGs tentam ao mesmo tempo', async () => {
    const doacao = await publicar();

    const respostas = await Promise.all([
      request(app).post(`/api/doacoes/${doacao.id}/aceitar`).send({ ong: 'ONG A' }),
      request(app).post(`/api/doacoes/${doacao.id}/aceitar`).send({ ong: 'ONG B' })
    ]);

    expect(respostas.map(({ status }) => status).sort()).toEqual([200, 400]);
  });

  it('EX-03: recusa organização cujo nome começa com pontuação', async () => {
    const doacao = await publicar();

    const resposta = await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({ ong: '.Cozinha Solidária' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('ong deve começar com uma letra ou número');
  });

  it('EX-04: recusa o aceite sem identificar a organização', async () => {
    const doacao = await publicar();

    const resposta = await request(app)
      .post(`/api/doacoes/${doacao.id}/aceitar`)
      .send({});

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('ong é obrigatório');
  });
});
