# Retrospectiva da Iteração 1

- **Data:** 03/09/2026 · **Grupo:** CodePenguins

## O que decidimos nesta iteração

- Priorizar o walking skeleton com o fluxo mínimo de publicar, listar e aceitar uma doação.
- Exigir somente tipo, quantidade e validade na publicação para equilibrar agilidade e rastreabilidade.
- Garantir o aceite único com uma atualização atômica no banco, condicionada ao estado disponível da doação.

## O que funcionou

- A separação entre regras de negócio e acesso ao banco deixou as responsabilidades claras.
- A divisão do trabalho em quatro commits independentes facilitou a revisão das mudanças.
- Os cinco critérios de aceite foram transformados em testes reais, e a suíte terminou com seis testes aprovados.

## O que mudaríamos

- Escrever os testes junto com cada incremento, em vez de mantê-los como pendentes até o final.
- Executar a suíte após cada mudança para identificar falhas mais cedo.
- Definir previamente as mensagens de erro e os casos inválidos aceitos pela API.

## Próximos passos (para a próxima iteração)

- Implementar o registro da retirada da doação.
- Medir o tempo entre publicação e retirada durante o piloto.
- Definir o tratamento de doações aceitas que não forem retiradas no prazo.
- Validar o fluxo completo pelo celular e com conexão instável.

## Autoavaliação de contribuição

| Integrante | Pontos | O que fez de mais relevante |
|---|:--:|---|
| André Schultz | 25 | Implementou o aceite atômico de uma doação no repositório. |
| José Henrique Brühmmüller | 25 | Implementou as regras de publicação, listagem e aceite de doações. |
| Matheus Büsemayer | 25 | Substituiu os cenários pendentes pelos testes automatizados reais. |
| Lucas Mönich Nunes | 25 | Implementou as consultas básicas de doações no repositório. |

**Total: 100**
