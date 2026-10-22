# ADR 0004 — SQLite nesta unidade e migração para PostgreSQL na Unidade 3

- **Data:** 2026-10-21
- **Status:** aceito no [PR #7](https://github.com/CodePenguinsCorp/prato-cheio/pull/7); SQLite vigente no código

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

Nesta unidade, `npm test` comprova apenas o comportamento em SQLite: `vitest.config.js` e `src/db.js` forçam `:memory:` durante o Vitest. Esse comando **não comprova** a migração para PostgreSQL.

Na Unidade 3, a validação exigirá um serviço PostgreSQL descartável no CI, com banco e credenciais exclusivos da execução. O job deverá fornecer `TEST_DATABASE_URL` para esse serviço, sem usar a conexão do piloto. A equipe deverá criar o script `test:postgres`, configurar a suíte para usar `DATABASE_URL` em vez de `:memory:` nesse modo e manter a recusa de limpeza fora do banco descartável. O script deverá falhar se a conexão PostgreSQL de teste não estiver disponível; um teste consultará `SELECT version()` e `SELECT current_database()` na **mesma conexão usada pelas regras de negócio**, comprovando que a suíte não executou em SQLite. O nome do banco, sozinho, não é a proteção: o serviço deve ser criado para o job e descartado ao fim dele.

**Comandos previstos para o job da Unidade 3** (após implementar o adaptador e o script; `TEST_DATABASE_URL` será definido pelo serviço de teste):

```bash
DATABASE_URL="$TEST_DATABASE_URL" npm run db:migrar
DATABASE_URL="$TEST_DATABASE_URL" npm run test:postgres
```

O segundo comando deverá executar CA-01 a CA-05 de `tests/doacoes.test.js`, o caso simultâneo EX-02 e a verificação de `/api/saude` contra PostgreSQL. Para o aceite único, EX-02 deverá obter exatamente uma resposta 200 e uma 400, com uma única ONG gravada na doação. A migração só será aceita se esses testes e o job `.github/workflows/ci.yml` passarem; `npm test` em SQLite continua sendo uma verificação separada. Esses comandos de PostgreSQL **ainda não são executáveis nesta unidade**.
