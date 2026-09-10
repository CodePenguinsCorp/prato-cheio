# Validação — Prato Cheio

*Trabalho 3 · confronto do produto com os critérios de aceite escritos na Unidade 1*

Referência: [regras e critérios de aceite da análise](analise.md). A avaliação abaixo é uma inspeção estática do código, sem execução de testes nesta revisão. RN01–RN11 orientam a primeira iteração; propostas ainda dependem da validação indicada na análise.

**Cobertura documental em Dado/Quando/Então: sim, para três histórias.** A história 1 possui CA01–CA04; a história 3, CA05 e CA11; e a história 4, CA06–CA10. CA02 também cobre a história 2. Esses critérios compõem o fluxo da história zero (★). A existência dos critérios não significa que estejam implementados ou aprovados em testes.

| Critério | Regras | Atendimento por inspeção | Evidência ou lacuna |
|---|---|---|---|
| CA01 — Publicação e estado inicial | RN01, RN04 | Sim | `src/doacoes.js` exige os campos; `src/db.js` atribui identificação, momento e estado inicial. |
| CA02 — Campos obrigatórios | RN01 | Sim | `exigirTexto` recusa ausência, texto vazio e espaços. |
| CA03 — Quantidade positiva com unidade | RN02 | Não | Quantidade aceita como texto não vazio, sem validação de valor ou unidade. |
| CA04 — Validade válida e futura | RN03 | Não | Não há validação temporal; a interface recebe somente data. |
| CA05 — Lista de disponíveis dentro da validade | RN05, RN09 | Parcial | `src/repositorio.js` filtra pelo estado, sem considerar validade. |
| CA06 — Reserva integral vinculada à organização | RN06, RN08–RN10 | Parcial | Atualiza toda a doação e preserva o registro; falta verificar validade e identificar a organização real na interface. |
| CA07 — Recusa de aceite inválido | RN05–RN07 | Parcial | Recusa doação inexistente ou aceita, mas não vencida. |
| CA08 — Aceites simultâneos | RN07 | Parcial | Atualização condicionada ao estado disponível protege a reserva; API retorna erro, mas a interface não o exibe. Concorrência ainda sem teste automatizado. |
| CA09 — Identificação obrigatória no aceite | RN08 | Parcial | A camada de negócio exige texto, mas a API substitui nome ausente por “ONG” e a interface envia “Minha ONG”. |
| CA10 — Reserva não equivale a retirada | RN11 | Parcial | Aceite mantém estado “aceita”; retirada e indicadores ainda não existem para validar o restante do critério. |
| CA11 — Nenhuma oferta apta | RN05 | Parcial | `public/index.html` informa quando a lista está vazia, mas a consulta não exclui doações vencidas ainda marcadas como disponíveis. |

## Critérios que não atendem — por quê

**Rastreabilidade dos cinco testes do walking skeleton:** [WS01–WS05 na análise](analise.md#cinco-critérios-do-walking-skeleton) registram Dado/Quando/Então e o nome exato de cada teste de negócio em `tests/doacoes.test.js`.

| Critério numerado | Critérios detalhados relacionados | Situação do teste |
|---|---|---|
| WS01 — Publicação aparece na lista | CA01, CA05 | `it.todo`, execução pendente. |
| WS02 — Campos obrigatórios | CA02 | `it.todo`, execução pendente. |
| WS03 — Aceite vinculado à ONG | CA06 | `it.todo`, execução pendente. |
| WS04 — Aceita sai da lista | CA05, CA06 | `it.todo`, execução pendente. |
| WS05 — Segundo aceite recusado | CA07 | `it.todo`, execução pendente. |

Essa correspondência cobre os cinco cenários mínimos, não todos os comportamentos dos CA relacionados: por exemplo, listar uma publicação não comprova o bloqueio de doações vencidas, e recusar um segundo aceite sequencial não comprova concorrência.

As lacunas estão indicadas na tabela. Quantidade, validade e reserva integral devem seguir a validação operacional descrita na análise. RN12–RN17 são propostas de evolução e ainda não possuem implementação ou critérios detalhados de aceite. A hipótese de aproveitamento depende do registro de retirada e cancelamento, por sistema ou acompanhamento manual padronizado.

Em `tests/doacoes.test.js`, os cinco cenários de negócio permanecem como `it.todo`; o teste ativo cobre somente a rota de saúde. Portanto, esta revisão não comprova as regras por testes automatizados.

## Mudanças de critério ao longo do semestre

CA01–CA11 explicitam as novas RN01–RN11. A revisão acrescenta validação de quantidade e validade, identificação da organização e distinção entre reserva e retirada, mantendo as exceções operacionais e métricas na evolução do piloto. Os critérios foram vinculados às histórias 1, 3 e 4 e separados em colunas Dado/Quando/Então; CA11 acrescenta o cenário de ausência de ofertas aptas, preservando os identificadores anteriores.

## Uso de IA

IA apoiou o mapeamento das regras para os critérios e a inspeção do código. Não foram executados testes nesta revisão documental; a validação pelos stakeholders permanece pendente nas regras propostas.
