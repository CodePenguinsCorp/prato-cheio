# ADR 0005 — Isolar o banco dos testes

- **Data:** 2026-10-21 (formalização de uma decisão já visível no repositório)
- **Status:** em vigor no código; aguardando revisão do grupo

## Contexto

Os critérios CA-01 a CA-05 da Análise precisam ser repetidos sem alterar as doações do desenvolvimento. A configuração original `vitest.config.js` apontava `DATABASE_FILE` para `:memory:` e os testes chamavam `limparBanco()` antes de cada caso.

## Alternativas consideradas

1. **SQLite em memória para testes:** execução rápida, descartável e sem arquivo persistente; não exercita persistência entre processos.
2. **Arquivo SQLite temporário por execução:** permite inspecionar o arquivo, mas exige criação e limpeza cuidadosas e pode deixar resíduos.
3. **Banco compartilhado de desenvolvimento:** dispensa configuração adicional, mas ameaça dados reais e torna os casos dependentes entre si.

## Decisão

Usar SQLite em memória para a suíte desta unidade, com limpeza entre os casos, mantendo o comportamento da API independente do banco de desenvolvimento.

## Consequências

- **Positivas:** testes reproduzíveis e rápidos, sem persistir doações de teste.
- **Negativas:** não cobrem a futura implementação em PostgreSQL nem persistência entre processos.
- **Quem paga o custo:** equipe que mantém testes e migração futura.
- **Riscos:** uma configuração errada poderia apontar a limpeza a outro banco; cobrir o risco com validação específica.

## Rastreabilidade

CA-01 a CA-05 e história zero em `docs/analise.md`; obrigação de testes por um comando no README.

## Critério de validação

`npm test` deve executar os critérios com SQLite em memória sem criar ou alterar `dados.sqlite`; a suíte confere o fluxo publicado, listado e aceito.

**Comando:** `npm test`.

## Revisão — 2026-10-21

A mudança de contexto do Trabalho 2 informa que o piloto possui doações reais e que uma rotina de limpeza, numa máquina configurada para o banco real, apagou essas doações. O repositório não contém evidência independente desse incidente; ele é tratado aqui como premissa fornecida para o incremento. A configuração original do Vitest, sozinha, não era uma barreira em `src/db.js`: `limparBanco()` executava `DELETE FROM doacoes` sem conferir o destino.

A decisão de usar banco em memória continua válida. A proteção foi ampliada: `src/db.js` força `:memory:` quando o Vitest executa a suíte, mesmo com `DATABASE_FILE` externo, e `limparBanco()` recusa qualquer arquivo SQLite. O risco deixou de ser apenas contaminar o desenvolvimento e passou a incluir perda de doações do piloto. `tests/banco-seguro.test.js` cria uma doação em arquivo temporário, tenta a limpeza sob configuração não teste, verifica que ela permanece e confirma que o modo Vitest usa e limpa somente memória. A suíte normal comprova que o banco correto continua utilizável. **Comando:** `npm test`.
