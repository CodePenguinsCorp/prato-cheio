# Refatorações — Prato Cheio

*Trabalho 3 · uma seção por refatoração · o que importa é o motivo e a evidência*

## Refatoração 1 — Migração de SQLite para PostgreSQL

- **Motivo:** o [ADR 0004](adr/0004-evolucao-do-banco.md) decidiu SQLite nas Unidades 1 e 2 e PostgreSQL na Unidade 3: SQLite em arquivo falha em pasta sincronizada/disco de rede e não atende o piloto com doações reais; a interface `query()` → `{ rows }` já existia para conter a troca.
- **O que mudou:**
  - `src/db.js`: `node:sqlite` → `pg` (`Pool`); `query()` continua devolvendo `{ rows }`; schema com `SERIAL` e `TIMESTAMPTZ DEFAULT now()`; `limparBanco()` passa a usar `TRUNCATE` e só roda sob o Vitest, com banco de `TEST_DATABASE_URL` (ou `DATABASE_URL` apenas no CI).
  - `src/repositorio.js`: marcadores `?` → `$1`, `$2`, …; o `UPDATE … WHERE status = 'disponivel' RETURNING *` do aceite único foi mantido.
  - `.github/workflows/ci.yml`: `services: postgres` e `DATABASE_URL` descomentados; passo `npm run db:migrar` antes dos testes.
  - `vitest.config.js`: `fileParallelism: false` (os arquivos de teste dividem o mesmo banco, antes cada processo tinha o seu `:memory:`).
  - `package.json` / `.env.example`: dependência `pg`, `DATABASE_URL` e `TEST_DATABASE_URL`.
- **O que NÃO mudou:** `src/doacoes.js` (regras de negócio) e `src/app.js` (rotas) ficaram fora do diff; os 14 testes de `tests/doacoes.test.js` rodam sem nenhuma alteração. Único teste tocado: `tests/banco-seguro.test.js`, que é específico do SQLite (chama `query()` com `?`, compara `COUNT(*)` com número e espera a mensagem "banco em memória"); só foram ajustados os marcadores para `$1…$3`, o `COUNT(*)::int` e o texto da mensagem — a propriedade verificada (limpeza recusada fora do modo de teste e banco "real" intacto) é a mesma. Esse ponto é apontado no PR para a revisão.
- **Evidência de que o comportamento se manteve:**
  - testes antes da mudança: 15 passando (SQLite em memória)
  - testes depois da mudança: 15 passando (PostgreSQL 16)
  - link da execução do CI verde: https://github.com/CodePenguinsCorp/prato-cheio/actions/runs/42309691752

## Refatoração 2 — Separar a validação de entrada das regras de negócio

- **Cheiro de código atacado:** responsabilidades misturadas em `src/doacoes.js` — `exigirTexto`, `exigirInicio` e `exigirDataIso` (validação de formato) vivem no mesmo módulo que decide as regras de negócio (aceite único, doação já aceita), e `aceitar()` mistura validação de `id`/`ong` com a regra.
- **Qual dor concreta isso resolvia:** a próxima mudança de regra de entrada (ex.: validade não pode estar no passado, ou limite de tamanho da quantidade) obriga a mexer no arquivo onde mora o aceite único, e não há como testar as validações isoladas, só pela API. Qualquer erro ali pode afetar a regra mais crítica do sistema (RN-02/RN-03).
- **O que mudou:** escolhida e registrada hoje; será aplicada, com testes, até o Trabalho 3 — extrair as funções `exigir*` para `src/validacao.js`, sem mudar mensagens de erro nem comportamento.
- **Evidência (testes verdes antes e depois):** a registrar no PR da refatoração (suíte de 15+ testes verde antes e depois, mais testes unitários de `validacao.js`).

---

**Limitações e o que ficou de fora:** (o que vocês viram e decidiram não refatorar, e por quê)
