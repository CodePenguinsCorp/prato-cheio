# ADR 0001 — SQLite nesta unidade e migração para PostgreSQL na Unidade 3

- **Data:** 2026-10-21
- **Status:** proposto para revisão do grupo; SQLite vigente no código

## Contexto

O README define SQLite embutido no Node para as Unidades 1 e 2 e PostgreSQL na Unidade 3. O fluxo mínimo da Análise precisa de instalação simples e orçamento próximo de zero. O README também registra falha de trava do SQLite em pasta sincronizada ou disco de rede. A hipótese do piloto ainda depende de dados de retirada acompanhados fora do sistema.

## Alternativas consideradas

1. **Permanecer em SQLite também na Unidade 3:** mantém instalação simples e os testes atuais; descumpre a migração exigida e conserva as restrições de arquivo.
2. **Migrar para PostgreSQL agora:** testa mais cedo o banco final; exige adaptar SQL, schema, testes e CI antes de concluir esta unidade.
3. **Manter SQLite nesta unidade e migrar para PostgreSQL na Unidade 3:** preserva o fluxo atual e cumpre o cronograma; concentra custo e risco de migração na próxima unidade.

Para executar PostgreSQL futuramente, há três caminhos coerentes: instalação local (simples para uso individual, difícil de reproduzir entre máquinas), contêiner (ambiente reproduzível, requer Docker) ou serviço (acesso compartilhado, dependência de rede e limites/custos). A escolha operacional ainda depende de validação do grupo; nenhuma está implementada.

## Decisão

Registrar a alternativa 3 como direção do projeto. **Não implementar PostgreSQL nesta unidade.** Na Unidade 3, manter o contrato `query()` que devolve `{ rows }` e adaptar o SQL específico: parâmetros `?`, `AUTOINCREMENT`, `datetime('now')` e `RETURNING`. Preservar o `UPDATE` condicionado a `status = 'disponivel'`.

## Consequências

- **Positivas:** instalação da Unidade 2 continua somente com Node; suíte atual segue reproduzível em SQLite.
- **Negativas:** a migração e a escolha de infraestrutura continuam pendentes; SQLite não deve ficar em pasta sincronizada ou disco de rede.
- **Quem paga o custo:** equipe de desenvolvimento e mantenedores do CI na Unidade 3; operadores do piloto ao configurar o banco final.
- **Riscos:** diferença de SQL e schema pode quebrar o aceite único ou testes; infraestrutura escolhida pode dificultar reprodução. Mitigar com testes CA-01 a CA-05, teste de concorrência e CI contra PostgreSQL quando migrado.

## Rastreabilidade

História zero e decisão de análise em `docs/analise.md`; RN-02/RN-03 e CA-03 a CA-05 para preservar o aceite único; restrição de banco por unidade e risco de arquivo no README.

## Critério de validação

Nesta unidade, `src/db.js` ainda abre SQLite, `npm test` passa e o CI usa Node sem serviço PostgreSQL. Na Unidade 3, a migração só estará validada quando schema, saúde, CA-01 a CA-05 e concorrência passarem no PostgreSQL configurado por `DATABASE_URL`.

**Comandos:** `npm test`; `npm run db:migrar` e `npm start` para o banco atual. Na Unidade 3, repetir a suíte e verificar o workflow `.github/workflows/ci.yml` com PostgreSQL. Esta segunda validação ainda não foi executada.
