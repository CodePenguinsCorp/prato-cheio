# ADR 0001 - Garantir aceite atômico da doação

- **Data:** 2026-09-18
- **Status:** aceito

## Contexto

As RN-02 e RN-03 determinam que uma doação aceita deixa de estar disponível e não pode ser aceita por outra ONG. Uma consulta seguida de uma atualização sem condição permite que duas requisições leiam o mesmo estado disponível antes de ambas escreverem. O CA-05 e o teste concorrente EX-02 exigem que haja exatamente um vencedor.

## Alternativas consideradas

1. **Atualização condicional atômica** - executar `UPDATE ... WHERE id = ? AND status = 'disponivel' RETURNING *`. É uma única operação, reduz a contenção e funciona no SQLite e no PostgreSQL; a aplicação precisa interpretar a ausência de linha como conflito.
2. **Transação com bloqueio** - iniciar uma transação de escrita, reler a doação sob bloqueio e atualizar se ainda estiver disponível. Também preserva a regra, mas amplia o tempo de bloqueio, exige commit/rollback e varia entre SQLite e PostgreSQL.

## Decisão

Adotar a alternativa 1. A condição no próprio `UPDATE` é a fonte da garantia concorrente. Uma consulta anterior pode melhorar a mensagem de erro, mas não substitui a condição atômica.

## Consequências

- **Positivas:** exatamente uma requisição altera o estado; menos código transacional; caminho simples para PostgreSQL.
- **Negativas:** uma atualização sem retorno pode significar “não encontrada” ou “já aceita”; a API precisa consultar ou mapear o caso quando quiser mensagens distintas.
- **Riscos e resposta:** uma futura alteração pode remover a condição por engano; manter `CA-05` e `EX-02` obrigatórios no CI.

## Rastreabilidade

Atende às **RN-02**, **RN-03**, **CA-05** e ao objetivo da história 4 da Unidade 1 de evitar conflito entre ONGs.
