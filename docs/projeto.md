# Documento de Projeto — Prato Cheio

*Trabalho 2 · máximo 4 páginas (fora diagramas) · entrega na Aula 10*

## Decisões de projeto

| # | Decisão | Alternativas | Requisito/risco da Análise que a motiva |
|---|---|---|---|
| D1 | **Problema:** evoluir o banco sem atrasar o fluxo mínimo. **Escolha:** SQLite nesta unidade; PostgreSQL na Unidade 3 ([ADR 0001](adr/0001-evolucao-do-banco.md)). **Motivo:** conserva instalação só com Node e cumpre a sequência do projeto. **Consequência:** SQL, schema, testes e CI terão de ser adaptados; SQLite mantém limitações de arquivo. | Permanecer em SQLite também na Unidade 3; migrar já; migrar na Unidade 3. Todas são tecnicamente possíveis, mas a primeira descumpre a entrega. | História zero e decisão de análise de baixo custo em [Análise](analise.md); RN-02/RN-03 exigem preservar aceite único. Restrição de migração e risco de arquivo no README. |
| D2 | **Problema:** limpeza de testes pode apagar doações do piloto. **Escolha:** forçar banco em memória durante o Vitest e recusar `limparBanco()` em arquivo ([ADR 0002](adr/0002-isolamento-do-banco-de-testes.md)). **Motivo:** duas barreiras independentes da configuração local. **Consequência:** testes não cobrem persistência entre processos; migração exigirá nova estratégia de isolamento. | Só definir `DATABASE_FILE=:memory:` na configuração; só validar destino na limpeza; combinar ambas. | CA-01 a CA-05 precisam de execução repetível; o incidente informado nesta unidade amplia o risco para dados reais. |
| D3 | **Problema:** duas ONGs podem disputar a mesma oferta. **Escolha:** aceite condicionado a `status = 'disponivel'` no `UPDATE`. **Motivo:** a condição é verificada na gravação. **Consequência:** `RETURNING` e a condição precisam ser preservados na migração. | Verificar status antes e gravar sem condição; verificar antes e condicionar também a atualização. Ambas permitem a interface atual, mas só a segunda protege a disputa. | RN-02/RN-03 e CA-03 a CA-05 da Análise; `tests/doacoes.test.js` inclui disputa simultânea. |

## Tabela de trade-offs (uma decisão em detalhe)

**D1 — critérios derivados da instalação simples do piloto, da migração exigida e do aceite único.**

| Critério | SQLite também na Unidade 3 | PostgreSQL agora | SQLite agora; PostgreSQL na Unidade 3 |
|---|---|---|---|
| Instalação nesta unidade | Só Node | Banco e conexão já necessários | Só Node |
| Testes existentes | Executam no SQLite atual | Precisam adaptação imediata | Executam agora; serão adaptados na Unidade 3 |
| Restrição de entrega | Não cumpre migração | Cumpre antes do prazo | Cumpre no prazo previsto |
| Custo e risco | Mantém limitações do arquivo | Antecipa adaptação de SQL, schema e CI | Adia adaptação; exige preservar aceite atômico |

Não há pontuação numérica: cada célula indica trabalho ou restrição observável no README, `src/db.js`, testes e CI. A forma de executar PostgreSQL (instalado, contêiner ou serviço) segue pendente de escolha pelo grupo no ADR 0001.

## Diagramas

- [Contexto](diagramas/contexto.md): atores, sistema, SQLite e acompanhamento externo.
- [Dados](diagramas/dados.md): única tabela `doacoes`, com as sete colunas de `src/db.js`.

**Conferência com `src/db.js`:** não havia diagrama anterior para sustentar três divergências históricas; o novo diagrama corresponde ao schema atual. Três **lacunas do modelo para evoluções mencionadas na Análise**, sem fingir que são divergências entre arquivos: não há identidade do doador; não há registro de retirada; não há horário do aceite. Nenhuma é implementada ou mostrada como existente no diagrama. A ausência de retirada exige planilha no piloto; o tratamento de não retirada continua indefinido em RN-04/RN-05.

## ADRs

- [ADR 0001 — SQLite → PostgreSQL na Unidade 3](adr/0001-evolucao-do-banco.md).
- [ADR 0002 — isolamento do banco de testes e revisão pelo incidente](adr/0002-isolamento-do-banco-de-testes.md).

## Requisitos não-funcionais

| Requisito | Como afeta o design |
|---|---|
| **RNF-01.** Quando uma pessoa acessa a interface em celular com viewport de 360 px, o sistema apresenta publicação e lista sem rolagem horizontal, medido por inspeção no navegador com largura de 360 px. Isso muda o layout responsivo da interface, a um custo de manutenção para a equipe de frontend. | Manter regras móveis de `public/custom.css`; a equipe de frontend paga a manutenção. Restrição de uso por celular na [Análise](analise.md). Requer inspeção humana em navegador. |
| **RNF-02.** Quando a suíte roda com `DATABASE_FILE` apontando para um arquivo com uma doação, o sistema usa memória e recusa limpeza no arquivo, medido por teste que confirma a linha original intacta e a memória limpa. Isso muda a seleção do banco e a rotina de limpeza, a um custo de manutenção para a equipe de testes. | `src/db.js` força memória no Vitest e restringe `limparBanco()`; equipe de testes mantém `tests/banco-seguro.test.js`. Reforça o isolamento do ADR 0002. |
| **RNF-03.** Quando duas ONGs aceitam a mesma doação disponível quase ao mesmo tempo, o sistema confirma exatamente um aceite e recusa o outro, medido por respostas HTTP 200 e 400 no teste EX-02. Isso muda a gravação para `UPDATE` condicionado ao status, a um custo de preservar essa semântica na migração pago pela equipe de backend. | `src/repositorio.js` mantém a condição no SQL; backend e futura migração pagam o custo. Deriva de RN-02/RN-03. |

## Critérios de validação do projeto

Cada pergunta admite **SIM/NÃO** mediante a fonte indicada; comandos locais não substituem CI remoto ou revisão humana.

| Pergunta verificável | Fonte no repositório |
|---|---|
| A API recusa publicar doação sem tipo, quantidade ou validade? | [Análise CA-02](analise.md), `src/doacoes.js`, `tests/doacoes.test.js` (`CA-02`). |
| A doação publicada aparece na lista de disponíveis? | [Análise CA-01](analise.md), `tests/doacoes.test.js` (`CA-01`). |
| O aceite associa a ONG, retira a oferta da lista e bloqueia segundo aceite? | [Análise CA-03 a CA-05](analise.md), `src/repositorio.js`, `tests/doacoes.test.js` (`CA-03` a `CA-05`, `EX-02`). |
| O teste com arquivo externo comprova que `limparBanco()` falha sem apagar a doação e que o Vitest usa memória? | `src/db.js`, `tests/banco-seguro.test.js`; executar `npm test`. |
| O diagrama de dados corresponde às sete colunas e aos padrões do schema atual? | [Diagrama de dados](diagramas/dados.md), `src/db.js` (`migrar`). |
| A migração SQLite → PostgreSQL está registrada para a Unidade 3, sem implementação nesta unidade, com critério futuro? | [ADR 0001](adr/0001-evolucao-do-banco.md), README, `src/db.js`, `.github/workflows/ci.yml`. |
| O CI instala dependências, testa e verifica a rota de saúde em PRs? | `.github/workflows/ci.yml`, `src/app.js` (`/api/saude`). |

## Incremento e história obrigatória

**História:** “Os testes não conseguem apagar nem alterar dados de um banco que não seja o de teste, seja qual for a máquina ou a configuração.” **Aceite:** Dado um arquivo SQLite com uma doação e configuração externa apontando para ele, quando o processo de teste tenta limpar o banco, então o arquivo permanece intacto; no modo Vitest, publicações e limpezas atingem apenas a memória. Evidência: `tests/banco-seguro.test.js`. As histórias de publicação, listagem e aceite da Análise permanecem; retirada e áreas por ator seguem como próximos passos, sem implementação nova nesta unidade.

## Uso de IA

Nesta execução, a IA analisou o código e a Análise, implementou a proteção e seu teste, e redigiu este projeto, diagramas e ADRs. O grupo ainda precisa revisar código, critérios, texto e decisões propostas; nenhuma revisão de outro integrante ou aprovação de PR é alegada. Uma proposta inicial de registrar “três divergências” entre diagrama e banco foi revista: não existia diagrama de dados anterior. Inventá-las falsificaria a evidência, por isso o diagrama foi criado fiel ao schema e as três lacunas futuras foram identificadas como lacunas, não divergências. A revisão foi necessária para manter rastreabilidade verificável.
