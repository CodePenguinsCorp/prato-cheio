# Validação — Prato Cheio

*Trabalho 3 · confronto do produto com os critérios de aceite da Unidade 1 e das histórias H1 a H4*

> **STATUS SUGERIDOS, A CONFIRMAR PELO GRUPO.** Só deixe "atende" em uma linha depois de conferir a evidência.

Evidência automatizada: `npm test` com **58 testes passando**, local, em 26/11/2026, PostgreSQL 16, na `main` com H1 a H4 (PRs [15](https://github.com/CodePenguinsCorp/prato-cheio/pull/15), [16](https://github.com/CodePenguinsCorp/prato-cheio/pull/16), [17](https://github.com/CodePenguinsCorp/prato-cheio/pull/17) e [18](https://github.com/CodePenguinsCorp/prato-cheio/pull/18)). [CI verde da `main`](https://github.com/CodePenguinsCorp/prato-cheio/actions/runs/45928464135). Os passos são os de [docs/demo.md](demo.md); a reprodução por um integrante e em celular real está **PENDENTE**. A [validação de 24/11](evidencias/validacao-aula-13.md) se refere à versão anterior.

| # | Critério de aceite | Status (sugerido) | Evidência |
|:--:|---|:--:|---|
| CA-01 | **Dado** uma doação completa, **quando** o doador publica, **então** ela aparece na lista de disponíveis. (histórias 1 e 3) | atende (A CONFIRMAR) | `CA-01` em `tests/doacoes.test.js`; demo, passo 2. |
| CA-02 | **Dado** que falta tipo, quantidade ou validade, **quando** o doador tenta publicar, **então** a publicação é recusada. (história 2) | atende (A CONFIRMAR) | `CA-02` (três campos), `tests/doacoes.test.js`; demo, passo 4. |
| CA-03 | **Dado** uma doação disponível, **quando** uma ONG aceita, **então** ela fica aceita e associada à ONG. (histórias ★ e 4) | atende (A CONFIRMAR) | `CA-03`, `tests/doacoes.test.js`; demo, passo 5. |
| CA-04 | **Dado** uma doação aceita, **quando** a lista é consultada, **então** ela não aparece entre as disponíveis. (histórias ★ e 4) | atende (A CONFIRMAR) | `CA-04`, `tests/doacoes.test.js`; demo, passo 5. |
| CA-05 | **Dado** uma doação já aceita, **quando** outra ONG tenta aceitar, **então** o segundo aceite é recusado. (histórias ★ e 4) | atende (A CONFIRMAR) | `CA-05` e `EX-02`, `tests/doacoes.test.js`; demo, passo 11. |
| H1-CA1 | Dado que a "Padaria Pão Bom" publicou duas doações e a "Casa Esperança" aceitou uma delas, quando a padaria consulta as suas doações, então vê as duas: uma disponível e outra aceita por Casa Esperança. | atende (A CONFIRMAR) | `H1-CA1` em `tests/h1-minhas-doacoes.test.js`; demo, passos 3 e 6. |
| H1-CA2 | Dado que outro doador publicou uma doação, quando a "Padaria Pão Bom" consulta as suas, então essa doação não aparece. | atende (A CONFIRMAR) | `H1-CA2` em `tests/h1-minhas-doacoes.test.js`; demo, passo 6. |
| H1-CA3 | Dado que o doador não é informado na publicação, quando a doação é enviada, então ela é recusada com uma mensagem clara e nada é gravado. | atende (A CONFIRMAR) | `H1-CA3` em `tests/h1-minhas-doacoes.test.js`; demo, passo 4. |
| H2-CA1 | Dado que a "Casa Esperança" aceitou uma doação, quando o voluntário "Rui" confirma a coleta, então ela passa a coletada, com o nome do voluntário e o horário da coleta. | atende (A CONFIRMAR) | `H2-CA1` em `tests/h2-confirmar-coleta.test.js`; demo, passo 7. |
| H2-CA2 | Dado que a doação ainda está disponível, quando alguém tenta confirmar a coleta, então a confirmação é recusada com mensagem e a doação não muda. | atende (A CONFIRMAR) | `H2-CA2` em `tests/h2-confirmar-coleta.test.js`; demo, passo 11. |
| H2-CA3 | Dado que a doação foi coletada, quando o doador consulta as suas doações (H1), então ela aparece como coletada. | atende (A CONFIRMAR) | `H2-CA3` em `tests/h2-confirmar-coleta.test.js`; demo, passo 9. |
| H3-CA1 | Dado que a "Casa Esperança" aceitou uma doação, quando ela a devolve com o motivo "sem voluntário hoje", então a doação volta para a lista de disponíveis, sem ONG, e o motivo fica registrado. | atende (A CONFIRMAR) | `H3-CA1` em `tests/h3-devolver.test.js`; demo, passos 8 e 9. |
| H3-CA2 | Dado que a doação já foi coletada, quando a ONG tenta devolvê-la, então a devolução é recusada com mensagem. | atende (A CONFIRMAR) | `H3-CA2` em `tests/h3-devolver.test.js`; demo, passo 11. |
| H3-CA3 | Dado que a "Casa Esperança" aceitou a doação, quando outra ONG tenta devolvê-la, então a devolução é recusada e a doação continua aceita pela Casa Esperança. | atende (A CONFIRMAR) | `H3-CA3` em `tests/h3-devolver.test.js`; demo, passo 11. |
| H4-CA1 | Dado que, em novembro, 3 doações foram publicadas, 2 aceitas e 1 coletada 5 horas depois de publicada, quando a Marta consulta o resultado de novembro, então vê 3 publicadas, 2 aceitas, 1 coletada e tempo médio até a coleta: 5 h. | atende (A CONFIRMAR) | `H4-CA1` em `tests/h4-resultado-do-mes.test.js`; a demo mostra a tela com outros números (passo 10). |
| H4-CA2 | Dado um mês sem nenhuma coleta, quando a Marta consulta o resultado, então o tempo médio aparece como sem coletas no mês — não como zero, nem como erro. | atende (A CONFIRMAR) | `H4-CA2` em `tests/h4-resultado-do-mes.test.js`; demo, passo 10. |
| H4-CA3 | Dado uma doação publicada em 31/10 e coletada em 01/11, quando a Marta consulta novembro, então o grupo decide em que mês ela conta — e o teste diz qual. | atende (A CONFIRMAR) | `H4-CA3` em `tests/h4-resultado-do-mes.test.js`; D12 (outubro); sem passo na demo. |

## Critérios que não atendem — por quê

Pela evidência automatizada, nenhum critério foi sugerido como "parcial" ou "não atende". O grupo deve rever esta seção se a execução no celular mostrar falha. Fora dos critérios:

- **Doação aceita e não retirada (RN-04, [ADR 0003](adr/0003-doacao-nao-retirada.md)):** não há prazo, aviso nem devolução automática. A ONG pode devolver (H3), mas depende dela.

## Mudanças de critério ao longo do semestre

- **CA-01 e RN-01 (A CONFIRMAR):** a "doação completa" passou a incluir o doador (H1-CA3). Os dados enviados nos testes antigos ganharam `doador`; o que eles verificam não mudou. Isso altera o "só três campos obrigatórios" da D2.
- **Métrica da Análise:** previa a **mediana de minutos** até a retirada; H4 pede a **média** (adotada em horas, D13).
- **Histórias 5, 6 e 7 da Análise:** retirada e medição passaram a existir com H2 e H4; o aviso de impedimento virou a devolução de H3, por ação da ONG, sem reoferta por prazo.
- **Confirmação da coleta:** desde o [PR 18](https://github.com/CodePenguinsCorp/prato-cheio/pull/18) exige `versaoAceite`, para que uma confirmação antiga não colete uma doação devolvida e aceita de novo.
- **Banco:** SQLite nas Unidades 1 e 2 e PostgreSQL agora (ADR 0004).
- **Não verificável:** uso com conexão instável e a meta de 70% de retiradas antes da validade dependem do piloto; o resultado do mês não compara a coleta com a validade.

## Uso de IA

- **Geração inicial declarada no PR:** rascunhos de `docs/demo.md`, `docs/validacao.md` e `docs/retrospectivas/3.md` a partir do código, dos testes, da Análise e do histórico Git.
- **Revisão de 24/11/2026:** a pedido de André Schultz, o Codex confrontou os cinco critérios com os testes, leu os logs do CI, instalou as dependências em clone novo, executou os 15 testes sobre PostgreSQL descartável e verificou publicação, listagem e aceite pela interface, erros pela API e dados finais no banco.
- **O que foi corrigido:** preparo reproduzível da demo, separação dos bancos, data e natureza da validação, links de evidência, distribuição de contribuição informada por André e registros de IA antes incompletos.
- **Limites:** não houve execução manual independente por outro integrante nem validação do piloto, da conexão instável ou da meta de retiradas. A IA não confirma essas atividades; os status dos CA se apoiam nos testes e na execução técnica registrada.

### Trabalho 3, H1 a H4 (26/11/2026)

- **H1:** a IA escreveu o código e os testes e rodou a suíte ([PR 15](https://github.com/CodePenguinsCorp/prato-cheio/pull/15)).
- **H2:** IA na geração e aplicação dos patches, nos testes e na inversão de regra ([PR 16](https://github.com/CodePenguinsCorp/prato-cheio/pull/16)).
- **H3 e Refatoração 2:** a IA gerou o código e os testes e rodou a suíte ([PR 17](https://github.com/CodePenguinsCorp/prato-cheio/pull/17)).
- **H4:** patches gerados e aplicados com IA, que também executou os testes; o código dos patches foi lido pelo autor ([PR 18](https://github.com/CodePenguinsCorp/prato-cheio/pull/18)).
- **Erro corrigido:** a revisão do PR 17 apontou três problemas no código (confirmação antiga coletando um novo aceite, estado desconhecido sem mensagem útil e motivo da devolução sumindo da consulta do doador). Foram corrigidos no PR 18, com apoio de IA, com testes de regressão.
- **Documentos:** a IA redigiu esta atualização a partir do código, dos testes e dos PRs.

## Limitações do produto

- Sem login: quem digita o nome de um doador ou de uma ONG vê as doações e pode agir como ela; qualquer pessoa pode confirmar uma coleta. Nomes iguais se misturam e grafias diferentes (acentos, espaços internos) se separam.
- Os nomes do doador e do voluntário são dados pessoais sem controle de acesso: também saem nas respostas gerais da API. Doações anteriores a H1 não têm doador.
- Só o último motivo de devolução é guardado; não há histórico nem horário do aceite, aviso, prazo ou bloqueio de doação vencida.
- O resultado usa o mês da publicação (pode mudar depois) e média em horas com uma casa; precisa de conexão e não foi testado com carga.
