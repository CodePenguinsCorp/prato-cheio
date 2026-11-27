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

## Refatoração 2 — Extrair a busca e a checagem de transição

- **Cheiro:** duplicação (terceira repetição). Com a primeira fatia de H3, `aceitar`, `confirmarColeta` e `devolver` começavam do mesmo jeito: validar o id, buscar a doação, recusar se não existe e conferir se a transição é permitida.
- **Dor na próxima mudança:** uma regra de estado nova ou alterada exigiria editar três funções, com as transições espalhadas em `if`s; as fatias seguintes de H3 criariam mais código sobre a cópia.
- **O que mudou:** em `src/doacoes.js`, a tabela `TRANSICOES` (estado de origem e mensagem para cada outro estado, como na D6), `exigirId` e `buscarParaTransicao`. As três operações usam as funções; cada uma mantém sua validação de entrada, e a posse da ONG continua em `devolver`.
- **O que não mudou:** rotas, SQL, testes e mensagens. A guarda no `UPDATE` de cada transição permanece, para o caso de ações simultâneas.
- **Evidência:**
  - no histórico do repositório, a extração entrou junto com a H3, em um único commit; por isso não há execução separada de antes e depois no CI
  - em um ensaio local com as mudanças separadas (PostgreSQL 16): **33 testes antes** e **33 depois**, sem alterar teste
  - no mesmo ensaio, os testes percebem a falha: sem a checagem de estado em `buscarParaTransicao`, 4 ficaram vermelhos (`CA-05`, `H2-CA2`, o limite da segunda confirmação e `H3-CA2`) pela mensagem trocada, porque a guarda do SQL ainda impediu a mudança de estado; a linha foi restaurada
  - [CI verde da `main` com H1 a H4](https://github.com/CodePenguinsCorp/prato-cheio/actions/runs/45928464135), com 58 testes na execução local
- **Revisão:** [PR 17](https://github.com/CodePenguinsCorp/prato-cheio/pull/17), aprovado por busemayer, sem comentários em linha. Os problemas apontados na revisão foram corrigidos no [PR 18](https://github.com/CodePenguinsCorp/prato-cheio/pull/18).

---

**Limitações e o que ficou de fora:** a separação da validação de entrada em `src/validacao.js`, cogitada antes de H3, não foi aplicada: a duplicação das transições estava no caminho das próximas fatias. Continuam repetidos o `try/catch` das rotas em `src/app.js` e a montagem de listas em `public/app.js`, que também cresceu e é candidato a ser dividido.
