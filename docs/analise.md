# Documento de Análise - Prato Cheio

*Trabalho 1 - máximo 4 páginas - entrega na Aula 5*

## Problema central

Doadores, ONGs e cozinhas comunitárias não coordenam oferta e retirada com rapidez e previsibilidade. A comunicação dispersa, a baixa rastreabilidade e as decisões demoradas aumentam o tempo de coleta e o descarte de alimentos próprios para consumo.

## Incertezas

- O principal gargalo do fluxo é mesmo o tempo entre oferta e coleta, como a Marta acredita, ou a maior perda acontece em outra etapa do processo?
- Quais campos obrigatórios são o mínimo aceitável para a vigilância sanitária sem tornar o cadastro lento demais para os doadores?
- Em quantos casos a retirada será feita pela própria ONG e em quantos dependerá de voluntários entregadores?
- Como medir de forma simples e consistente o impacto real das doações retiradas, especialmente a estimativa de refeições viabilizadas?
- O que deve acontecer quando uma ONG aceita uma doação, mas não consegue registrar a retirada dentro do prazo esperado?

## Stakeholders
| Stakeholder | Interesse | Influência | Evidência no caso | Consequência para a iteração 1 |
|---|---|---|---|---|
| Doadores | Publicar excedentes com pouco atrito. | Alta | Originam as ofertas. | Priorizar cadastro com três campos. |
| ONGs e cozinhas | Encontrar e reservar alimentos em tempo útil. | Alta | Recebem as doações. | Priorizar listagem e aceite. |
| Marta | Fazer o piloto funcionar e reduzir perdas. | Alta | Patrocinadora e operação. | Validar escopo e regras operacionais. |
| Vigilância sanitária | Garantir rastreabilidade mínima. | Alta | Pode impedir a circulação. | Exigir tipo, quantidade e validade. |
| Voluntários | Usar o fluxo no celular e com conexão instável. | Baixa | Atuam na rua. | Considerar uso móvel; logística fica fora. |
| Famílias atendidas | Receber alimento seguro em tempo útil. | Baixa | Sofrem o impacto final. | Representação inicial pelas ONGs. |

## Objetivos de impacto
| Objetivo | Métrica | Linha de base | Direção | Como obter a linha de base |
|---|---|---|---|---|
| Reduzir tempo até a retirada. | Mediana de minutos entre publicação e retirada. | Desconhecida. | Diminuir | Registrar horários no piloto. |
| Aumentar retiradas antes da validade. | Percentual das publicações. | Desconhecida. | Aumentar | Comparar publicadas e retiradas em duas semanas. |
| Aumentar refeições viabilizadas. | Estimativa semanal das ONGs. | Desconhecida. | Aumentar | Registrar após cada retirada. |

## Regras de negócio

| # | Origem | Regra ou ausência |
|:---:|---|---|
| RN-01 | Imposta | Uma doação só pode ser publicada com tipo, quantidade e validade. |
| RN-02 | Dita | Ao ser aceita, a doação deixa de ficar disponível para outras ONGs. |
| RN-03 | Derivada | Uma doação já aceita não pode receber um segundo aceite. |
| RN-04 | Ausente | O caso não define o que ocorre quando a ONG aceita e não retira. |
| RN-05 | Ausente | O caso não autoriza retorno automático à lista após um prazo. |

## Conflitos de prioridade
| Campo | Conteúdo |
|---|---|
| Fala 1 | "Eu quero cadastrar uma doação em poucos segundos, sem preencher um formulário grande." (doador) |
| Fala 2 | "Eu preciso de rastreabilidade mínima para saber o que foi doado e se isso pode circular com segurança." (vigilância sanitária) |
| Eixo do trade-off | Quantidade de campos obrigatórios no cadastro da doação. |
| O que cada lado perde | Se o formulário crescer, o doador perde rapidez e pode desistir de publicar; se o formulário encolher demais, a vigilância perde rastreabilidade e aumenta o risco sanitário. |
| Critério que decide | Na iteração 1, só são obrigatórios tipo, quantidade e validade; observações, foto e detalhes adicionais ficam opcionais e não bloqueiam a publicação. |
| Saída usada | decidir |
| Data e medição até lá, se adiar | Não se aplica. |


## Histórias de usuário
| # | História (Como… quero… para…) | INVEST: o que falha | Ação corretiva |
|---|---|---|---|
| ★ | Como ONG, quero ver e aceitar uma doação para reservá-la antes que se perca. | `S`, `E` | Cortar para publicar → listar → aceitar → sair da lista. |
| 1 | Como doador, quero publicar tipo, quantidade e validade para colocar o excedente em circulação. | `V` | Expressar o benefício fora do sistema. |
| 2 | Como vigilância, quero recusar publicação incompleta para manter rastreabilidade mínima. | `I` | Limitar aos três dados conhecidos. |
| 3 | Como ONG, quero listar doações disponíveis para decidir o que consigo retirar. | `N` | Retirar filtros, mapa e proximidade. |
| 4 | Como Marta, quero que a doação aceita saia da lista para evitar conflito entre ONGs. | `S` | Unir saída da lista e bloqueio do segundo aceite. |
| 5 | Como ONG, quero registrar a retirada para encerrar a doação com rastreabilidade. | `E` | Adiar foto, geolocalização e assinatura. |
| 6 | Como Marta, quero medir o tempo até a retirada para testar o gargalo da coleta. | `S`, `V` | Manter uma única métrica. |
| 7 | Como ONG, quero informar que não retirei para permitir uma decisão operacional. | `N` | Remover a reoferta automática não autorizada. |

As histórias 3, 4 e 5 são as três fatias demonstráveis da história gigante “encontrar, aceitar e retirar a doação certa”.


**História zero (★)**

**Por que ela:** porque a regra de negócio central do caso é tirar a doação da comunicação dispersa e colocá-la num fluxo rastreável em que uma ONG vê a oferta, a aceita e, a partir daí, ela deixa de estar disponível para outra organização.

**O que ficou fora:** autenticação, logística, voluntários, confirmação física, notificações, relatórios, priorização e reoferta automática. Esses itens ampliam custo ou dependem de regras ainda não validadas sem serem necessários para provar publicação → descoberta → aceite.

## Critérios de aceite

| # | História | Dado | Quando | Então |
|:---:|:---:|---|---|---|
| CA-01 | 1 e 3 | Uma doação completa | O doador publica | Ela aparece na lista de disponíveis. |
| CA-02 | 2 | Falta tipo, quantidade ou validade | O doador tenta publicar | A publicação é recusada. |
| CA-03 | ★ e 4 | Uma doação disponível | Uma ONG aceita | Ela fica aceita e associada à ONG. |
| CA-04 | ★ e 4 | Uma doação aceita | A lista é consultada | Ela não aparece entre as disponíveis. |
| CA-05 | ★ e 4 | Uma doação já aceita | Outra ONG tenta aceitar | O segundo aceite é recusado. |

Os testes usam os mesmos identificadores em `tests/doacoes.test.js`.

## Riscos

| Risco | Prob. | Impacto | Mitigação | Responsável |
|---|:---:|:---:|---|---|
| Doador abandonar um cadastro demorado. | Média | Alto | Manter três campos e testar com três doadores. | Marta e equipe |
| Doação ser aceita e não retirada no prazo. | Alta | Alto | Acompanhar manualmente no piloto e definir com Marta a regra de tratamento. | Marta e ONG |

## Hipótese e experimento

**Hipótese:** durante um piloto de duas semanas em um bairro, pelo menos 70% das doações publicadas serão aceitas antes da validade usando o fluxo centralizado.

**Experimento:** operar com ao menos três doadores e duas ONGs, registrar publicação, aceite e validade em uma planilha e calcular `aceitas antes da validade / publicadas × 100`. Resultado inferior a 70% invalida a hipótese. O registro manual é uma limitação consciente da primeira iteração.

## Decisão de análise

- **Problema:** validar o fluxo principal com orçamento próximo de zero e sem inventar políticas operacionais.
- **Alternativa 1:** publicar, listar e aceitar; entrega rápida, mas não cobre a retirada física.
- **Alternativa 2:** incluir autenticação, mapas, notificações, entregadores e relatórios; cobre mais, mas aumenta custo e risco antes de haver evidência.
- **Decisão:** adotar a Alternativa 1 por ser a menor fatia que testa o valor e a regra central.
- **Limitações:** não confirma retirada, não resolve logística ou conexão instável e depende de acompanhamento manual no piloto.

## Uso de IA
A IA foi usada para gerar histórias candidatas; o grupo revisou tudo antes de aproveitar.
- `#1`: gerou "Como usuário, quero cadastrar uma doação". Mudamos para `doador de alimentos` e incluímos tipo, quantidade e validade, porque "usuário" não é stakeholder e faltava rastreabilidade mínima. Regra inventada: endereço obrigatório; decide Marta com a vigilância sanitária.
- `#5`: gerou retirada com foto e geolocalização. Reduzimos para registro manual, porque essa prova tornava a fatia grande demais. Regra inventada: retirada só vale com geolocalização; decide Marta com as ONGs.
- `#7`: gerou reoferta automática da doação e aviso para todas as ONGs. Mantivemos só o aviso de impedimento, porque essa política não aparece no caso. Regra inventada: a doação volta sozinha para a fila; decide Marta.
