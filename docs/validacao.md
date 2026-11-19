# Validação — Prato Cheio

*Trabalho 3 · confronto do produto com os critérios de aceite escritos na Unidade 1*

Critérios copiados de `docs/analise.md`. Evidência dos testes: CI verde sobre PostgreSQL ([execução 42309691752](https://github.com/CodePenguinsCorp/prato-cheio/actions/runs/42309691752)), que roda `npm test` (`tests/doacoes.test.js`). Passos citados são os de `docs/demo.md`.

| # | Critério de aceite (da Unidade 1) | Atende? | Evidência |
|:--:|---|:--:|---|
| CA-01 | **Dado** uma doação completa, **quando** o doador publica, **então** ela aparece na lista de disponíveis. (histórias 1 e 3) | atende | Teste `CA-01` em `tests/doacoes.test.js`; passos 2 e 3 da demo; CI verde (link acima). |
| CA-02 | **Dado** que falta tipo, quantidade ou validade, **quando** o doador tenta publicar, **então** a publicação é recusada. (história 2) | atende | Teste `CA-02` (um caso por campo ausente); passos 4 e 7 da demo; CI verde. |
| CA-03 | **Dado** uma doação disponível, **quando** uma ONG aceita, **então** ela fica aceita e associada à ONG. (histórias ★ e 4) | atende | Teste `CA-03`; passo 5 da demo; CI verde. |
| CA-04 | **Dado** uma doação aceita, **quando** a lista é consultada, **então** ela não aparece entre as disponíveis. (histórias ★ e 4) | atende | Teste `CA-04`; passo 5 da demo; CI verde. |
| CA-05 | **Dado** uma doação já aceita, **quando** outra ONG tenta aceitar, **então** o segundo aceite é recusado. (histórias ★ e 4) | atende | Teste `CA-05` e `EX-02` (aceites simultâneos, só um vence); passo 6 da demo; CI verde. |

## Critérios que não atendem — por quê

Nenhum dos cinco critérios da Unidade 1 ficou em "parcial" ou "não atende". O que está **fora** desses critérios (e portanto não validado aqui):

- **Registro da retirada (história 5), medição do tempo até a retirada (história 6) e aviso de não retirada (história 7):** não existem critérios de aceite escritos para elas na Unidade 1 e o produto não as implementa. Ficaram de fora porque a Alternativa 1 da análise adotou só publicar, listar e aceitar; o piloto acompanha a retirada em planilha. Consequência: a hipótese dos 70% de retiradas antes da validade só pode ser medida manualmente.
- **Doação aceita e não retirada (RN-04, RN-05):** decisão adiada no [ADR 0003](adr/0003-doacao-nao-retirada.md) (tratamento manual, sem reoferta automática), pendente de Marta e das ONGs.

## Mudanças de critério ao longo do semestre

- **Nenhum critério CA-01 a CA-05 foi alterado.** Os testes continuam com os mesmos identificadores.
- **Critérios adicionais (EX-01 a EX-05)** surgiram nos testes depois da Unidade 1: validade em data real no formato AAAA-MM-DD, aceite simultâneo, nome da ONG sem pontuação inicial, ONG obrigatória e interface servida com CSS/JS externos. Detalham os CA, não os substituem.
- **Banco:** os critérios foram verificados em SQLite (U1 e U2) e agora em PostgreSQL (ADR 0004); o comportamento se manteve, com os testes de critério sem alteração.
- **Não verificável:** o uso no celular com conexão instável (stakeholder voluntários) e a meta de 70% de retiradas não foram verificados; dependem do piloto.

## Uso de IA

[REVISAR antes de entregar: o texto abaixo descreve o que foi feito com IA nesta entrega; o grupo precisa confirmar que verificou cada ponto.]

- **O que a IA fez nesta iteração:** redigiu o rascunho de `docs/demo.md`, `docs/validacao.md` e `docs/retrospectivas/3.md` a partir do código, dos testes, do `docs/analise.md` e do histórico do Git.
- **O que o grupo verificou:** ____ (listar: executou os passos da demo, conferiu cada status contra o teste e o CI, rodou `npm test`).
- **O que alteramos:** ____.
- **Limite:** a IA não executou a demo nem a suíte localmente (sem PostgreSQL disponível); os status "atende" se apoiam no CI verde e na leitura dos testes, e só valem depois que um integrante rodar os passos e confirmar.
