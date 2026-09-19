# ADR 0002 — Centralizar a validação dos dados mínimos

- **Data:** 2026-09-18
- **Status:** aceito

## Contexto

A RN-01 exige tipo, quantidade e validade, enquanto o risco de abandono pede um cadastro curto. A regra deve valer para qualquer cliente da API, não apenas para a interface web, e o CA-02 exige rejeitar a publicação incompleta.

## Alternativas consideradas

1. **Validação na camada de negócio** — validar e normalizar os três campos antes de chamar o repositório. O front-end pode repetir verificações para dar retorno rápido, sem ser a autoridade da regra.
2. **Restrições no banco com tradução na camada HTTP** — deixar `NOT NULL`/`CHECK` recusarem dados inválidos e converter os erros técnicos em respostas da API. Protege a persistência, mas acopla mensagens e casos de validação ao banco.

## Decisão

Adotar a alternativa 1 como fonte da regra. Restrições simples no schema permanecem como defesa adicional, sem substituir a validação de negócio.

## Consequências

- **Positivas:** comportamento consistente para qualquer interface; mensagens específicas; testes rápidos da regra; menor impacto na futura troca do banco.
- **Negativas:** parte das restrições também existe no schema e precisa ser mantida coerente.
- **Riscos e resposta:** novos pontos de entrada podem contornar a camada; expor persistência somente pelo serviço de negócio e cobrir a API com o teste CA-02.

## Rastreabilidade

Atende à **RN-01** e ao **CA-02**. Mitiga simultaneamente o risco de abandono do cadastro e a necessidade de rastreabilidade mínima da vigilância sanitária.
