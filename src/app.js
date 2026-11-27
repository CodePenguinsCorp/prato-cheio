import express from 'express';
import * as doacoes from './doacoes.js';

// O relógio é um parâmetro para os testes controlarem as datas.
export function criarApp({ relogio = () => new Date() } = {}) {
  const app = express();
  app.use(express.json());
  app.use(express.static('public'));

  // Verificação de saúde: usada pelo CI para provar que a aplicação sobe.
  app.get('/api/saude', (req, res) => res.json({ ok: true }));

  app.get('/api/doacoes', async (req, res) => {
    try {
      res.json(await doacoes.listarDisponiveis());
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  app.get('/api/minhas-doacoes', async (req, res) => {
    try {
      res.json(await doacoes.listarDoDoador(req.query.doador));
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  app.get('/api/doacoes-da-ong', async (req, res) => {
    try {
      res.json(await doacoes.listarDaOng(req.query.ong));
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  app.post('/api/doacoes', async (req, res) => {
    try {
      res.status(201).json(await doacoes.criarDoacao(req.body, relogio()));
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  app.post('/api/doacoes/:id/aceitar', async (req, res) => {
    try {
      res.json(await doacoes.aceitar(req.params.id, req.body?.ong));
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  app.post('/api/doacoes/:id/coletar', async (req, res) => {
    try {
      res.json(await doacoes.confirmarColeta(req.params.id, req.body?.voluntario, relogio()));
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  app.post('/api/doacoes/:id/devolver', async (req, res) => {
    try {
      res.json(await doacoes.devolver(req.params.id, req.body));
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  return app;
}
