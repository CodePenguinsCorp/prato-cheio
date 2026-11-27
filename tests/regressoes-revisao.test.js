import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { migrar, limparBanco, query, encerrar } from '../src/db.js';
import { publicar, aceitar } from './apoio.js';

const app = criarApp();
beforeEach(async () => { await migrar(); await limparBanco(); });
afterAll(encerrar);

describe('regressões da revisão de H3 e refatoração', () => {
  it.each(['ONG A', 'ONG B'])('recusa a coleta do aceite anterior depois de %s aceitar novamente', async (ong) => {
    const doacao = await publicar(app);
    const primeiroAceite = await aceitar(app, doacao.id, 'ONG A');
    const devolucao = await request(app).post(`/api/doacoes/${doacao.id}/devolver`).send({ ong: 'ONG A', motivo: 'sem voluntário' });
    expect(devolucao.status).toBe(200);
    const novoAceite = await aceitar(app, doacao.id, ong);

    const antiga = await request(app).post(`/api/doacoes/${doacao.id}/coletar`)
      .send({ voluntario: 'Voluntário antigo', versaoAceite: primeiroAceite.versao_aceite });
    expect(antiga.status).toBe(400);
    expect(antiga.body.erro).toBe('o aceite mudou; atualize a página');
    const consulta = await request(app).get('/api/doacoes-da-ong').query({ ong });
    expect(consulta.body[0]).toMatchObject({ status: 'aceita', ong, voluntario: null });

    const atual = await request(app).post(`/api/doacoes/${doacao.id}/coletar`)
      .send({ voluntario: 'Voluntário atual', versaoAceite: novoAceite.versao_aceite });
    expect(atual.status).toBe(200);
  });

  it('recusa coleta sem identificar o aceite atual', async () => {
    const doacao = await publicar(app);
    await aceitar(app, doacao.id);
    const resposta = await request(app).post(`/api/doacoes/${doacao.id}/coletar`).send({ voluntario: 'Rui' });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('identifique o aceite atual para confirmar a coleta');
  });

  it.each(['aceitar', 'coletar', 'devolver'])('retorna mensagem útil para estado desconhecido ao %s', async (acao) => {
    const doacao = await publicar(app);
    await query('UPDATE doacoes SET status = $1 WHERE id = $2', ['cancelada', doacao.id]);
    const resposta = await request(app).post(`/api/doacoes/${doacao.id}/${acao}`)
      .send({ ong: 'ONG A', voluntario: 'Rui', motivo: 'sem voluntário' });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('estado da doação inválido');
  });
});
