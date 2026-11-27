# Inversão da regra de identificação do doador

Executada com assistência do Codex em 26/11/2026, após o commit `17cb397`, em PostgreSQL 16 descartável.

- Regra invertida: em `src/doacoes.js`, substituir temporariamente `doador: exigirTexto(doador, 'doador')` por `doador`.
- Comando: `npm test`, com `TEST_DATABASE_URL` local exclusivo de testes.
- Resultado: **3 testes vermelhos, 19 verdes**: `H1-CA3: recusa publicação sem doador e não grava nada`; `H1-L1: recusa nome em branco ou de tipo inválido na publicação`; `H1-L3: preserva doação antiga sem inventar doador e permite migrar novamente`.
- Inversão desfeita: **sim**. `git diff --exit-code -- src/doacoes.js` sem diferença; nova execução: **22/22 testes verdes**.

A terceira falha comprova também que retirar a normalização quebra a consulta pelo mesmo nome com espaços nas bordas. O experimento não altera a versão entregue.
