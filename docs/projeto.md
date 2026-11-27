# Documento de Projeto — Prato Cheio

*Trabalho 2 · máximo 4 páginas (fora diagramas) · entrega na Aula 10*

**Responsáveis e revisores das etapas:**

| Etapas | Responsável | Revisor |
|---|---|---|
| 0 (organização), 8 (conferência) e 9 (entrega) | José Henrique Brühmüller | Lucas Monich Nunes |
| 1 (decisões), 3 (ADRs), 4 (mudança de contexto), 5 (não funcionais) e 6 (histórias) | Matheus Büsemayer | José Henrique Brühmüller |
| 2 (diagramas) e 7 (uso de IA) | Lucas Monich Nunes | André Schultz |

## Decisões de projeto

| # | Decisão | Alternativa A | Alternativa B | Escolha | Requisito ou risco da Unidade 1 |
|:--:|---|---|---|---|---|
| D1 | Como impedir que duas ONGs reservem a mesma doação? | Fazer uma atualização condicional e atômica no banco (`UPDATE ... WHERE status = 'disponivel'`). | Abrir uma transação com bloqueio de escrita, reler o estado e então atualizar. | **A**, por preservar a regra em uma única operação, funcionar no SQLite e exigir menos coordenação da aplicação. | **RN-02, RN-03 e CA-05:** uma doação aceita deixa de estar disponível e não pode ter um segundo aceite. |
| D2 | Onde garantir os três dados mínimos da publicação? | Validar tipo, quantidade e validade na camada de negócio; o front-end pode repetir a validação apenas para resposta rápida. | Usar restrições no banco e converter os erros na camada HTTP. | **A**, porque mantém a regra independente da interface e produz mensagens úteis sem acoplar o comportamento ao banco. Restrições simples no schema continuam como defesa adicional. | **RN-01 e CA-02**, além do risco “doador abandonar um cadastro demorado”: só os três campos mínimos bloqueiam a publicação. |
| D3 | Como tratar uma doação aceita que não foi retirada? | Registrar manualmente a ocorrência e manter a doação fora da lista até decisão da Marta, sem reoferta automática. | Expirar a reserva após um prazo configurado e recolocar a doação automaticamente na lista. | **A, provisoriamente**, até o piloto fornecer prazo seguro e autorização operacional; a decisão deve ser revista com Marta e as ONGs. | **RN-04, RN-05** e risco “doação ser aceita e não retirada no prazo” (probabilidade e impacto altos). |
| D4 | Quando migrar para PostgreSQL? | Migrar nesta unidade, antecipando adaptação de SQL, schema, testes e CI. | Manter SQLite agora e migrar na Unidade 3. | **B**, por conservar a instalação só com Node e cumprir o cronograma; manter SQLite também na Unidade 3 descumpriria a entrega. | História zero, baixo custo do piloto, restrição de migração no README e RN-02/RN-03. |
| D5 | Como impedir que os testes apaguem dados do piloto? | Definir somente `DATABASE_FILE=:memory:` na configuração. | Forçar memória no Vitest e recusar `limparBanco()` em arquivo. | **B**, com duas barreiras independentes da configuração local; persistência entre processos e isolamento em PostgreSQL exigirão validação futura. | CA-01 a CA-05 e risco de perda de dados reais apresentado no incremento. |
| D6 | Quais são os estados da doação e o que acontece fora das transições? (contrato de H1 a H4) | Três estados (`disponivel`, `aceita`, `coletada`) e três transições: aceitar (`disponivel` → `aceita`), confirmar coleta (`aceita` → `coletada`) e devolver (`aceita` → `disponivel`). Qualquer outra é recusada com HTTP 400 e mensagem, sem alterar a doação. | Criar também o estado `devolvida`. | **A (proposta, a confirmar pelo grupo):** a devolvida volta inteira para a lista sem criar um quarto estado. | CA-05, RN-02/RN-03 e H1 a H4. |
| D7 | H1: o que fazer com as doações publicadas sem doador? | Deixar `doador` vazio: continuam disponíveis e não aparecem em consulta de doador. | Atribuir um doador padrão. | **A (proposta):** não inventa autoria. No piloto elas seriam de alguém; a atribuição teria de ser feita com a Marta. | H1; preservação dos dados. |
| D8 | H1: como o doador se identifica sem login? | Nome digitado, lembrado no navegador e comparado sem diferenciar maiúsculas e espaços nas pontas. | Código secreto por doador. | **A (proposta):** é a mais simples; a falta de proteção vai para as limitações. | H1; risco de cadastro demorado. |
| D9 | H2: o que acontece na segunda confirmação, e o nome do voluntário é obrigatório? | Recusar e manter o primeiro registro. Nome obrigatório; guarda-se só o nome, visto nas consultas do doador e da ONG. | Ignorar em silêncio e aceitar coleta sem nome. | **A (proposta):** deixa o erro visível e a coleta rastreável com um único dado pessoal. | H2; rastreabilidade. |
| D10 | H3: o motivo é obrigatório, onde fica e quem o vê? | Obrigatório, na coluna `motivo_devolucao` (só o da última devolução), visto na consulta do doador; não entra na lista, na consulta da ONG nem no resultado. | Tabela de histórico de devoluções, visível também à Marta. | **A (proposta):** atende o CA1 sem tabela nova e sem guardar qual ONG devolveu. | H3; D3 (não há devolução automática: é ação da ONG). |
| D11 | H3: a ONG que devolveu pode aceitar de novo? | Sim. | Bloquear aquela ONG para aquela doação. | **A (proposta):** a devolução não é punição, e bloquear exigiria guardar quem devolveu. | H3. |
| D12 | H4: em que mês a doação conta, e as devolvidas entram? | Mês da **publicação**, no fuso `America/Sao_Paulo`; a devolvida conta como publicada e só conta como aceita se estiver aceita ou coletada. | Mês da coleta. | **A (proposta):** publicadas, aceitas e coletadas descrevem o mesmo conjunto. O número de um mês pode mudar depois que ele termina. | H4 CA3; objetivo de reduzir o tempo até a retirada. |
| D13 | H4: como apresentar o tempo médio? | Média em horas, com uma casa decimal, contada da publicação original; sem coletas, "sem coletas no mês". | Minutos, ou a mediana prevista na Análise. | **A (proposta):** é o formato do CA1. Coletas de poucos minutos aparecem como 0 h ou 0,1 h. | H4 CA1/CA2. |

As decisões D1 a D5 têm registro detalhado nos ADRs listados na seção [ADRs](#adrs).

## Tabela de trade-offs (uma decisão em detalhe)

### D1: concorrência no aceite

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

### D4: evolução do banco

**D4 - critérios derivados da instalação simples do piloto, da migração exigida e do aceite único.**

| Critério | SQLite também na Unidade 3 | PostgreSQL agora | SQLite agora; PostgreSQL na Unidade 3 |
|---|---|---|---|
| Instalação nesta unidade | Só Node | Banco e conexão já necessários | Só Node |
| Testes existentes | Executam no SQLite atual | Precisam adaptação imediata | Executam agora; serão adaptados na Unidade 3 |
| Restrição de entrega | Não cumpre migração | Cumpre antes do prazo | Cumpre no prazo previsto |
| Custo e risco | Mantém limitações do arquivo | Antecipa adaptação de SQL, schema e CI | Adia adaptação; exige preservar aceite atômico |

Não há pontuação numérica: cada célula indica trabalho ou restrição observável no README, `src/db.js`, testes e CI. A forma de executar PostgreSQL (instalado, contêiner ou serviço) segue pendente de escolha pelo grupo no ADR 0004.

## Diagramas

Os dois diagramas da atividade **Modelagem do sistema** estão em [`docs/diagramas/contexto.md`](diagramas/contexto.md) e [`docs/diagramas/dados.md`](diagramas/dados.md), com imagem e fonte PlantUML. O contexto apresenta os atores, as informações trocadas e a fronteira do produto; a persistência SQLite é interna. O modelo de dados mostra a única tabela `doacoes`, suas sete colunas conforme `src/db.js` e a transição do aceite por `status` e `ong`.

A geração inicial, os três erros de contexto, as fontes, as correções e a conferência pessoal das fontes pelo grupo estão no [registro da revisão com IA](evidencias/revisao-ia-diagramas.md). A Vigilância permanece no contexto como origem de requisito, em nota sem fluxo de dados.

**Conferência com `src/db.js`:** não foram encontradas divergências entre o modelo atual e a implementação nos três pontos abaixo.

| Ponto conferido | Resultado |
|---|---|
| Entidades e atributos | Uma tabela `doacoes`, com as sete colunas do schema; `ong` é texto, sem chave estrangeira. |
| Restrições e padrões | Chave primária autoincremental; cinco campos não chave `NOT NULL`; `ong` anulável; padrões `disponivel` e `datetime('now')`. |
| Representação do aceite | `status` e `ong` representam disponível/sem ONG e aceita/com ONG. A transição condicional é feita em `src/repositorio.js`; o schema não tem `CHECK` dos estados. |

Não há identidade do doador, registro de retirada ou horário do aceite no banco nem no modelo. São lacunas de evolução, não divergências. A retirada continua acompanhada em planilha; a decisão provisória D3 não autoriza reoferta automática.

## Histórias do Trabalho 3 e testes

As decisões D6 a D13 são propostas até o grupo confirmá-las. Desde H1 a H3, `doacoes` também tem `doador`, `voluntario`, `coletada_em` e `motivo_devolucao`, todas anuláveis e criadas por `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. A conferência da seção Diagramas e o diagrama de dados descrevem o modelo da Unidade 2 e ainda precisam ser atualizados.

| História | Testes (`tests/`) | Critérios | Casos limite e decisões |
|---|---|---|---|
| H1: o doador acompanha as suas doações | `h1-minhas-doacoes.test.js` | `H1-CA1` a `H1-CA3` | consulta sem nome, doações antigas, maiúsculas, schema com linhas |
| H2: o voluntário confirma a coleta | `h2-confirmar-coleta.test.js` | `H2-CA1` a `H2-CA3` | segunda confirmação, simultâneas, sem voluntário, doação inexistente, consulta da ONG |
| H3: a ONG devolve uma doação aceita | `h3-devolver.test.js` | `H3-CA1` a `H3-CA3` | sem motivo, sem ONG, devolver duas vezes, aceitar de novo, maiúsculas |
| H4: a Marta vê o resultado do mês | `h4-resultado-do-mes.test.js` | `H4-CA1` a `H4-CA3` | virada do mês no fuso, arredondamento, devolvida, mês inválido |

Datas: `criarApp({ relogio })` recebe o relógio. H2 e H4 fixam os instantes e preparam o estado pela API, então o resultado não depende do dia da execução. Tipos: `COUNT` e a média são convertidos no SQL (`::int` e `::float8`).

## ADRs

Os ADRs registram contexto, alternativas, decisão, consequências e rastreabilidade: [0001 - aceite atômico](adr/0001-aceite-atomico.md) e [0002 - dados mínimos](adr/0002-validacao-dados-minimos.md) estão aceitos; [0003 - não retirada](adr/0003-doacao-nao-retirada.md) permanece proposto; [0004 - evolução do banco](adr/0004-evolucao-do-banco.md) e [0005 - isolamento dos testes](adr/0005-isolamento-do-banco-de-testes.md) foram revisados no [PR #7](https://github.com/CodePenguinsCorp/prato-cheio/pull/7), aprovado por José e integrado na main. O modelo `0000-modelo-adr.md` fica disponível para decisões futuras.

## Requisitos não-funcionais

| Requisito | Como afeta o design |
|---|---|
| **RNF-01.** Quando uma pessoa acessa a interface em celular com viewport de 360 px, o sistema apresenta publicação e lista sem rolagem horizontal, medido por inspeção no navegador com largura de 360 px. | Manter o layout responsivo de `public/custom.css`; a equipe de frontend paga a manutenção. Restrição de uso por celular na [Análise](analise.md). Requer inspeção em navegador. |
| **RNF-02.** Quando a suíte roda com `DATABASE_FILE` apontando para um arquivo com uma doação, o sistema sob Vitest usa memória; uma tentativa de limpeza em arquivo fora desse modo é recusada. Medido por teste que confirma a linha original intacta e a memória limpa. | `src/db.js` força memória no Vitest e restringe `limparBanco()`; a equipe de testes paga a manutenção de `tests/banco-seguro.test.js` e das duas barreiras do ADR 0005. |
| **RNF-03.** Quando duas ONGs aceitam a mesma doação disponível quase ao mesmo tempo, o sistema confirma exatamente um aceite e recusa o outro, medido por respostas HTTP 200 e 400 no teste EX-02. | Manter o `UPDATE` condicionado ao status em `src/repositorio.js`; a equipe de backend paga a preservação dessa semântica na migração. Deriva de RN-02/RN-03. |

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

### Incremento e história obrigatória

**História:** “Os testes não conseguem apagar nem alterar dados de um banco que não seja o de teste, seja qual for a máquina ou a configuração.” **Aceite:** Dado um arquivo SQLite com uma doação e configuração externa apontando para ele, quando o processo de teste tenta limpar o banco, então o arquivo permanece intacto; no modo Vitest, publicações e limpezas atingem apenas a memória. Evidência: `tests/banco-seguro.test.js`. As histórias de publicação, listagem e aceite da Análise permanecem; retirada e áreas por ator seguem como próximos passos, sem implementação nova nesta unidade.

## Uso de IA

A IA apoiou a organização das alternativas e da matriz de trade-offs. O grupo revisou a rastreabilidade, as notas, os pesos e a decisão provisória D3 em relação à análise da Unidade 1.

Na contribuição integrada da `main`, a IA analisou o código e a Análise, implementou a proteção e seu teste, e redigiu este projeto, diagramas e ADRs. Essa contribuição foi revisada por José no [PR #7](https://github.com/CodePenguinsCorp/prato-cheio/pull/7); a modelagem foi revisada no [PR #8](https://github.com/CodePenguinsCorp/prato-cheio/pull/8). Na primeira versão da decisão de aceite atômico dessa contribuição (D1 neste documento), a IA sugeriu consultar o status e depois atualizar sem condição como alternativa viável. A conferência com RN-03 mostrou que duas ONGs poderiam passar pela consulta e confirmar o aceite; a alternativa foi corrigida para transação com bloqueio antes da consulta. Já havia um diagrama Mermaid na main antes desta branch; ele foi substituído por PlantUML, sem mudança no schema.

Nesta integração, a IA conciliou os conteúdos das duas branches e renumerou os ADRs de evolução do banco e isolamento dos testes para 0004 e 0005, preservando os ADRs existentes.

Na branch de modelagem, a IA revisou contexto e dados, detalhou as trocas de informação, colocou o requisito da Vigilância em nota e gerou imagens PNG com comando de atualização documentado. O [registro da revisão](evidencias/revisao-ia-diagramas.md) preserva os três erros da versão inicial, suas correções, a conferência pessoal das fontes pelo grupo e as ressalvas técnicas.

Neste fechamento, a IA apoiou os campos iniciais dos diagramas e a conferência com o banco; o grupo definiu responsáveis e revisores.
