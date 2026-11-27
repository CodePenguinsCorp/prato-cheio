# Inversão da regra de coleta

Executada com assistência do Codex em 26/11/2026, após `a3363f2`, em PostgreSQL 16 descartável.

- Regra invertida: permitir coletar uma doação disponível, removendo temporariamente a guarda de estado de `coletar()` em `src/doacoes.js` e permitindo `disponivel` no `UPDATE` de `src/repositorio.js`. A proteção está em duas camadas; inverter apenas uma não libera a operação.
- Comando: `npm test` com banco de teste exclusivo.
- Resultado: **1 teste vermelho e 28 verdes**: `H2-CA2: recusa coletar doação disponível sem alterar seu estado`.
- Inversão desfeita: **sim**. As duas fontes foram restauradas e `git diff --exit-code` não mostrou diferença; nova suíte: **29/29 verdes**.

A inversão comprova que o critério impede uma coleta sem aceite. Não foi incluída no código entregue.
