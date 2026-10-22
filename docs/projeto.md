# Documento de Projeto — Prato Cheio

*Trabalho 2 · máximo 4 páginas (fora diagramas) · entrega na Aula 10*

## Decisões de projeto

| # | Decisão | Alternativa A | Alternativa B | Escolha | Requisito ou risco da Unidade 1 |
|:--:|---|---|---|---|---|
| D1 | Como impedir que duas ONGs reservem a mesma doação? | Fazer uma atualização condicional e atômica no banco (`UPDATE ... WHERE status = 'disponivel'`). | Abrir uma transação com bloqueio de escrita, reler o estado e então atualizar. | **A**, por preservar a regra em uma única operação, funcionar no SQLite e exigir menos coordenação da aplicação. | **RN-02, RN-03 e CA-05:** uma doação aceita deixa de estar disponível e não pode ter um segundo aceite. |
| D2 | Onde garantir os três dados mínimos da publicação? | Validar tipo, quantidade e validade na camada de negócio; o front-end pode repetir a validação apenas para resposta rápida. | Usar restrições no banco e converter os erros na camada HTTP. | **A**, porque mantém a regra independente da interface e produz mensagens úteis sem acoplar o comportamento ao banco. Restrições simples no schema continuam como defesa adicional. | **RN-01 e CA-02**, além do risco “doador abandonar um cadastro demorado”: só os três campos mínimos bloqueiam a publicação. |
| D3 | Como tratar uma doação aceita que não foi retirada? | Registrar manualmente a ocorrência e manter a doação fora da lista até decisão da Marta, sem reoferta automática. | Expirar a reserva após um prazo configurado e recolocar a doação automaticamente na lista. | **A, provisoriamente**, até o piloto fornecer prazo seguro e autorização operacional; a decisão deve ser revista com Marta e as ONGs. | **RN-04, RN-05** e risco “doação ser aceita e não retirada no prazo” (probabilidade e impacto altos). |
| D4 | Quando migrar para PostgreSQL? | Migrar nesta unidade, antecipando adaptação de SQL, schema, testes e CI. | Manter SQLite agora e migrar na Unidade 3. | **B**, por conservar a instalação só com Node e cumprir o cronograma; manter SQLite também na Unidade 3 descumpriria a entrega. | História zero, baixo custo do piloto, restrição de migração no README e RN-02/RN-03. |
| D5 | Como impedir que os testes apaguem dados do piloto? | Definir somente `DATABASE_FILE=:memory:` na configuração. | Forçar memória no Vitest e recusar `limparBanco()` em arquivo. | **B**, com duas barreiras independentes da configuração local; persistência entre processos e isolamento em PostgreSQL exigirão validação futura. | CA-01 a CA-05 e risco de perda de dados reais apresentado no incremento. |

As cinco decisões têm registro detalhado em [`docs/adr/`](adr/):

- [ADR 0001 - aceite atômico](adr/0001-aceite-atomico.md);
- [ADR 0002 - validação dos dados mínimos](adr/0002-validacao-dados-minimos.md);
- [ADR 0003 - doação aceita e não retirada](adr/0003-doacao-nao-retirada.md);
- [ADR 0004 - evolução do banco](adr/0004-evolucao-do-banco.md);
- [ADR 0005 - isolamento do banco de testes](adr/0005-isolamento-do-banco-de-testes.md).

## Tabela de trade-offs - D1: concorrência no aceite

Escala: **1 (pior) a 5 (melhor)**. Os pesos refletem o impacto das RN-02/RN-03: correção concorrente é mais importante que conveniência de implementação. A pontuação ponderada é `nota × peso`.

| Critério | Peso | A - atualização condicional atômica | B - transação com bloqueio |
|---|:--:|:--:|:--:|
| Garante um único vencedor sob concorrência | 5 | 5 - a condição é verificada na própria escrita | 5 - o bloqueio serializa os concorrentes |
| Simplicidade de implementação e revisão | 3 | 5 - uma instrução SQL | 2 - exige início, commit, rollback e tratamento do bloqueio |
| Compatibilidade com SQLite e futura migração para PostgreSQL | 3 | 5 - ambos aceitam a atualização condicional | 3 - os mecanismos de bloqueio diferem entre os bancos |
| Tempo de bloqueio e contenção | 2 | 5 - bloqueio restrito à atualização | 2 - a transação mantém o bloqueio por mais tempo |
| Clareza do resultado para a API | 2 | 5 - linha retornada significa sucesso; ausência significa conflito | 4 - é preciso distinguir estado inválido, timeout e conflito |
| **Total ponderado** |  | **75/75** | **52/75** |

**Decisão:** adotar A. A consulta prévia pode continuar existindo para diferenciar “não encontrada” de “já aceita”, mas não é a garantia de exclusão mútua; essa garantia pertence ao `UPDATE` condicional. O teste concorrente `EX-02` deve continuar executando no CI para detectar regressões.

## Tabela de trade-offs - D4: evolução do banco

**D4 - critérios derivados da instalação simples do piloto, da migração exigida e do aceite único.**

| Critério | SQLite também na Unidade 3 | PostgreSQL agora | SQLite agora; PostgreSQL na Unidade 3 |
|---|---|---|---|
| Instalação nesta unidade | Só Node | Banco e conexão já necessários | Só Node |
| Testes existentes | Executam no SQLite atual | Precisam adaptação imediata | Executam agora; serão adaptados na Unidade 3 |
| Restrição de entrega | Não cumpre migração | Cumpre antes do prazo | Cumpre no prazo previsto |
| Custo e risco | Mantém limitações do arquivo | Antecipa adaptação de SQL, schema e CI | Adia adaptação; exige preservar aceite atômico |

Não há pontuação numérica: cada célula indica trabalho ou restrição observável no README, `src/db.js`, testes e CI. A forma de executar PostgreSQL (instalado, contêiner ou serviço) segue pendente de escolha pelo grupo no ADR 0004.

## Diagramas

Os diagramas PlantUML complementares estão em [`docs/diagramas/contexto.md`](diagramas/contexto.md) e [`docs/diagramas/dados.md`](diagramas/dados.md). O diagrama de contexto apresenta os atores, as informações trocadas e os limites do produto; a persistência SQLite é interna. O diagrama de dados mostra a única tabela `doacoes` e suas sete colunas conforme `src/db.js`.

**Conferência com `src/db.js`:** não há identidade do doador, registro de retirada ou horário do aceite. Essas lacunas não estão implementadas nem aparecem no diagrama. A ausência de retirada exige planilha no piloto; o tratamento de não retirada segue a decisão provisória D3, sem reoferta automática e sujeito à validação com Marta e as ONGs.

## ADRs

Os ADRs 0001 a 0005 registram contexto, alternativas, decisão, consequências e rastreabilidade até a Unidade 1. Os ADRs 0001 e 0002 estão aceitos; o ADR 0003 permanece proposto; o ADR 0004 registra a direção de migração para revisão do grupo; o ADR 0005 documenta o isolamento já vigente no código, também aguardando revisão. O arquivo `0000-modelo-adr.md` permanece como modelo para decisões futuras.

## Requisitos não-funcionais

| Requisito | Como afeta o design |
|---|---|
| **RNF-01.** Quando uma pessoa acessa a interface em celular com viewport de 360 px, o sistema apresenta publicação e lista sem rolagem horizontal, medido por inspeção no navegador com largura de 360 px. Isso muda o layout responsivo da interface, a um custo de manutenção para a equipe de frontend. | Manter regras móveis de `public/custom.css`; a equipe de frontend paga a manutenção. Restrição de uso por celular na [Análise](analise.md). Requer inspeção humana em navegador. |
| **RNF-02.** Quando a suíte roda com `DATABASE_FILE` apontando para um arquivo com uma doação, o sistema usa memória e recusa limpeza no arquivo, medido por teste que confirma a linha original intacta e a memória limpa. Isso muda a seleção do banco e a rotina de limpeza, a um custo de manutenção para a equipe de testes. | `src/db.js` força memória no Vitest e restringe `limparBanco()`; equipe de testes mantém `tests/banco-seguro.test.js`. Reforça o isolamento do ADR 0005. |
| **RNF-03.** Quando duas ONGs aceitam a mesma doação disponível quase ao mesmo tempo, o sistema confirma exatamente um aceite e recusa o outro, medido por respostas HTTP 200 e 400 no teste EX-02. Isso muda a gravação para `UPDATE` condicionado ao status, a um custo de preservar essa semântica na migração pago pela equipe de backend. | `src/repositorio.js` mantém a condição no SQL; backend e futura migração pagam o custo. Deriva de RN-02/RN-03. |
| Facilidade de uso no celular | O cadastro mantém somente tipo, quantidade e validade como campos obrigatórios. |
| Evolução do banco | O acesso a dados permanece isolado em `src/repositorio.js` e `src/db.js`, reduzindo o impacto da migração futura para PostgreSQL. |
| Auditabilidade das mudanças | A `main` está protegida e recebe mudanças por Pull Request com CI verde e revisão. A evidência fica em [`docs/evidencias/protecao-main.md`](evidencias/protecao-main.md). |

## Critérios de validação do projeto

Cada pergunta admite **SIM/NÃO** mediante a fonte indicada; comandos locais não substituem CI remoto ou revisão humana.

| Pergunta verificável | Fonte no repositório |
|---|---|
| A API recusa publicar doação sem tipo, quantidade ou validade? | [Análise CA-02](analise.md), `src/doacoes.js`, `tests/doacoes.test.js` (`CA-02`). |
| A doação publicada aparece na lista de disponíveis? | [Análise CA-01](analise.md), `tests/doacoes.test.js` (`CA-01`). |
| O aceite associa a ONG, retira a oferta da lista e bloqueia segundo aceite? | [Análise CA-03 a CA-05](analise.md), `src/repositorio.js`, `tests/doacoes.test.js` (`CA-03` a `CA-05`, `EX-02`). |
| O teste com arquivo externo comprova que `limparBanco()` falha sem apagar a doação e que o Vitest usa memória? | `src/db.js`, `tests/banco-seguro.test.js`; executar `npm test`. |
| O diagrama de dados corresponde às sete colunas e aos padrões do schema atual? | [Diagrama de dados](diagramas/dados.md), `src/db.js` (`migrar`). |
| A migração SQLite → PostgreSQL está registrada para a Unidade 3, sem implementação nesta unidade, com critério futuro? | [ADR 0004](adr/0004-evolucao-do-banco.md), README, `src/db.js`, `.github/workflows/ci.yml`. |
| O CI instala dependências, testa e verifica a rota de saúde em PRs? | `.github/workflows/ci.yml`, `src/app.js` (`/api/saude`). |
| A proteção da `main` exige Pull Request, CI verde e revisão? | [Evidência da proteção](evidencias/protecao-main.md). |

Para D3, registrar no piloto quantas doações aceitas não são retiradas e em quanto tempo; só então decidir se há base para expiração automática.

## Incremento e história obrigatória

**História:** “Os testes não conseguem apagar nem alterar dados de um banco que não seja o de teste, seja qual for a máquina ou a configuração.” **Aceite:** Dado um arquivo SQLite com uma doação e configuração externa apontando para ele, quando o processo de teste tenta limpar o banco, então o arquivo permanece intacto; no modo Vitest, publicações e limpezas atingem apenas a memória. Evidência: `tests/banco-seguro.test.js`. As histórias de publicação, listagem e aceite da Análise permanecem; retirada e áreas por ator seguem como próximos passos, sem implementação nova nesta unidade.

## Uso de IA

A IA apoiou a organização das alternativas e da matriz de trade-offs. O grupo revisou a rastreabilidade, as notas, os pesos e a decisão provisória D3 em relação à análise da Unidade 1.

Na contribuição integrada da `main`, a IA analisou o código e a Análise, implementou a proteção e seu teste, e redigiu este projeto, diagramas e ADRs. A revisão do grupo sobre essa contribuição continua pendente; o registro de revisão acima se refere às decisões D1 a D3 e à matriz de concorrência. Na primeira versão da decisão de aceite atômico dessa contribuição (D1 neste documento), a IA sugeriu consultar o status e depois atualizar sem condição como alternativa viável. A conferência com RN-03 mostrou que duas ONGs poderiam passar pela consulta e confirmar o aceite; a alternativa foi corrigida para transação com bloqueio antes da consulta. Também foi revista a proposta de registrar “três divergências” entre diagrama e banco: não existia diagrama de dados anterior. O novo diagrama segue o schema; as três ausências citadas são lacunas futuras, não divergências. Essas correções evitam alternativas inseguras e evidência inventada.

Nesta integração, a IA conciliou os conteúdos das duas branches e renumerou os ADRs de evolução do banco e isolamento dos testes para 0004 e 0005, preservando os ADRs existentes.
