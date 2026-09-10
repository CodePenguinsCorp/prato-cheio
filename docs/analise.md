# Documento de Análise - Prato Cheio

*Trabalho 1 - máximo 4 páginas - entrega na Aula 5*

## Problema central

Doadores de alimentos excedentes, ONGs e cozinhas comunitárias não conseguem coordenar a oferta e a retirada das doações com rapidez e previsibilidade suficientes. Hoje, a coleta depende de comunicação operacional dispersa, pouca rastreabilidade e decisões demoradas, o que aumenta o tempo entre a oferta e a retirada, faz doações se perderem antes do aproveitamento e reduz o número de refeições que poderiam chegar às famílias.

## Incertezas

- O principal gargalo do fluxo é mesmo o tempo entre oferta e coleta, como a Marta acredita, ou a maior perda acontece em outra etapa do processo?
- Quais campos obrigatórios são o mínimo aceitável para a vigilância sanitária sem tornar o cadastro lento demais para os doadores?
- Em quantos casos a retirada será feita pela própria ONG e em quantos dependerá de voluntários entregadores?
- Como medir de forma simples e consistente o impacto real das doações retiradas, especialmente a estimativa de refeições viabilizadas?
- O que deve acontecer quando uma ONG aceita uma doação, mas não consegue registrar a retirada dentro do prazo esperado?

## Stakeholders
| Stakeholder | Interesse | Influência | Evidência no caso | Consequência para a iteração 1 |
|---|---|---|---|---|
| Doadores (restaurantes, padarias e mercados) | Escoar excedente com pouco atrito e sem perder tempo no cadastro. | Alta | O caso lista os doadores como origem das ofertas; sem eles não existe doação para circular. | Entrevistar na primeira rodada e aceitar agora requisitos do cadastro e da publicação da doação. |
| ONGs e cozinhas comunitárias | Saber o que está disponível cedo o bastante para organizar retirada e preparo. | Alta | O caso as coloca como destino da doação e o fluxo base do produto depende de elas verem e aceitarem a oferta. | Entrevistar na primeira rodada e aceitar agora requisitos de listagem, visualização e aceite. |
| Marta | Fazer o piloto funcionar e reduzir o gargalo no tempo de coleta. | Alta | O material a identifica como patrocinadora e operação, além de atribuir a ela a hipótese de que o tempo de coleta é o gargalo. | Validar com ela o recorte da iteração 1 e aceitar agora regras operacionais e prioridades do piloto. |
| Vigilância sanitária | Garantir rastreabilidade mínima e conformidade para a circulação do alimento. | Alta | O caso diz que ela não usa o sistema, mas decide, e que exige registrar tipo, quantidade e validade. | Consultar antes de fechar o formulário e aceitar agora apenas requisitos obrigatórios de conformidade. |
| Voluntários entregadores | Conseguir usar o fluxo em celular, na rua e com conexão instável. | Baixa | O caso explicita o contexto de uso em mobilidade e conexão instável. | Ouvir cedo para restrições de uso, mas deixar requisitos mais avançados de entrega para depois do fluxo doador -> ONG. |
| Famílias que recebem a refeição | Receber alimento em tempo útil e em condições seguras. | Baixa | Elas não aparecem na lista-base da aula, mas sofrem diretamente a consequência final quando a doação atrasa, se perde ou chega inadequada. | Representar por meio das ONGs na iteração 1; não entrevistar antes de validar o piloto básico. |

## Objetivos de impacto
| Objetivo | Métrica | Linha de base | Direção | Como obter a linha de base |
|---|---|---|---|---|
| Reduzir o tempo entre a publicação da doação e a retirada registrada. | Tempo mediano, em minutos, entre publicar e registrar retirada. | Hoje desconhecida. | Diminuir. | Medir desde o primeiro dia do piloto, registrando horário de publicação e horário de retirada em cada doação. |
| Aumentar a proporção de doações publicadas que são efetivamente retiradas antes da validade. | Percentual de doações publicadas com retirada confirmada antes da validade. | Hoje desconhecida. | Aumentar. | Levantar nas duas primeiras semanas do piloto, comparando total publicado com total retirado dentro do prazo. |
| Aumentar o número estimado de refeições viabilizadas por semana pelas doações coletadas. | Refeições estimadas por semana, calculadas pelas ONGs a partir de tipo e quantidade recebidos. | Hoje desconhecida. | Aumentar. | Pedir que cada ONG piloto registre a estimativa de aproveitamento ao confirmar cada retirada nas primeiras semanas. |

## Regras de negócio

As RN01–RN11 orientam a primeira iteração; as RN12–RN17 são propostas para a evolução do piloto. “Implementada” indica presença no código, não comprovação por testes. Regras propostas dependem de validação com os responsáveis antes da implementação.

| Código | Regra de negócio | Situação atual |
|---|---|---|
| RN01 | A publicação exige tipo de alimento, quantidade e validade. Campos vazios ou contendo apenas espaços não são aceitos. | Implementada. |
| RN02 | A quantidade ofertada deve ser maior que zero e acompanhada de unidade compreensível, como quilogramas, litros, unidades ou porções. | Proposta; atualmente qualquer texto não vazio é aceito. |
| RN03 | A validade deve representar data e hora válidas, posteriores ao momento da publicação. | Proposta; atualmente só se verifica o preenchimento e a interface recebe apenas data. |
| RN04 | Toda doação publicada recebe identificação única, momento da publicação e estado inicial “disponível”, sem organização destinatária. | Implementada. |
| RN05 | Somente doações disponíveis e dentro da validade podem aparecer na lista de ofertas e receber aceite. Ao atingir a validade, ficam inaptas a novas reservas. | Parcial; o código considera o estado, mas não a validade. |
| RN06 | O aceite exige que a doação exista e esteja disponível no momento da confirmação. A condição de validade da RN05 também se aplica. | Parcial; existência e estado são verificados, validade não. |
| RN07 | Cada doação pode ter somente uma reserva ativa. Em aceites simultâneos, somente uma organização pode concluir a reserva; as demais devem ser informadas da indisponibilidade. | Parcial; o banco protege o aceite único e a API retorna erro, mas a interface não exibe o erro. |
| RN08 | O aceite deve vincular a doação à organização responsável pela retirada. | Parcial; registra um nome, mas a interface envia “Minha ONG” e a API usa “ONG” quando o nome é omitido. |
| RN09 | Após o aceite, a doação assume o estado “aceita” e sai da lista de disponíveis, preservando seu registro. | Implementada. |
| RN10 | Na primeira iteração, o aceite reserva toda a quantidade publicada para uma única organização, sem divisão da oferta ou aceite parcial. | Proposta compatível com o fluxo atual; validar com Marta. |
| RN11 | O aceite representa reserva, não comprova retirada e não permite contabilizar a doação como retirada ou como refeição viabilizada. | Distinção adotada; retirada e indicadores ainda não existem no sistema. |

**Evolução do piloto — propostas ainda não implementadas**

| Código | Regra de negócio |
|---|---|
| RN12 | A confirmação de retirada deve estar vinculada à doação e à organização responsável, registrando quando ocorreu. Cada doação só pode ser concluída uma vez. |
| RN13 | O aviso de impossibilidade de retirada deve ser encaminhado à Marta para decisão operacional, sem provocar reoferta automática. |
| RN14 | A reoferta somente pode ocorrer dentro da validade e após o encerramento da reserva anterior, preservando seu histórico. |
| RN15 | O cancelamento deve preservar o registro da doação e seu motivo. Se houver reserva, a organização responsável deve ser comunicada. Doações com retirada concluída não podem ser canceladas. |
| RN16 | O indicador de aproveitamento considera as doações retiradas antes da validade sobre o total publicado no período, excluindo as canceladas. Sem doações elegíveis, apresenta “sem dados”. |
| RN17 | A estimativa de refeições considera apenas doações com retirada confirmada e utiliza critério acordado com as ONGs. O aceite isolado não gera estimativa. |

**Responsáveis e decisões pendentes:** Marta responde pelas políticas operacionais de reserva, conflitos, cancelamento e reoferta, a validar com doadores e ONGs. Tipo, quantidade, unidades e validade devem ser validados com os envolvidos e a vigilância sanitária; estas regras não afirmam conformidade sanitária completa. Marta e as ONGs devem definir o critério de estimativa de refeições. Não há prazo de reserva de duas horas aprovado: janela, alertas e eventual extensão permanecem pendentes, sem autorizar aceite após a validade. Para RN03 e RN05, ainda é necessário definir horário e fuso da validade e a referência de tempo usada nas verificações. A identificação da organização na RN08 não exige, nesta fatia, cadastro ou autenticação.

## Conflitos de prioridade
| Campo | Conteúdo |
|---|---|
| Fala 1 | "Eu quero cadastrar uma doação em poucos segundos, sem preencher um formulário grande." (doador) |
| Fala 2 | "Eu preciso de rastreabilidade mínima para saber o que foi doado e se isso pode circular com segurança." (vigilância sanitária) |
| Eixo do trade-off | Quantidade de campos obrigatórios no cadastro da doação. |
| O que cada lado perde | Se o formulário crescer, o doador perde rapidez e pode desistir de publicar; se o formulário encolher demais, a vigilância perde rastreabilidade e aumenta o risco sanitário. |
| Critério que decide | Na publicação, só são obrigatórios tipo, quantidade e validade (RN01); RN02 e RN03 propõem validar o conteúdo desses campos. Observações, foto e detalhes adicionais não são exigidos e não bloqueiam a publicação. |
| Saída usada | decidir |
| Data e medição até lá, se adiar | Não se aplica. |


## Histórias de usuário

### História gigante original e decomposição

**HG01 — Coordenar a oferta e a reserva de doações**

> Como Marta, responsável pela operação do Prato Cheio, quero que doadores publiquem alimentos excedentes e que ONGs encontrem e reservem essas ofertas com exclusividade, para coordenar as doações e evitar conflitos de retirada.

Esta formulação explicita a história maior que reúne as histórias 1, 3 e 4 já existentes. Ela concentra publicação, descoberta e reserva em uma única entrega, dificultando estimativa e demonstração incremental (critérios INVEST `S` e `E`). A decomposição mantém o objetivo comum e permite verificar cada resultado separadamente:

| História derivada | Parte da HG01 | Demonstração da fatia | Critérios relacionados |
|---|---|---|---|
| 1 — Publicar uma doação | O doador coloca o excedente à disposição. | Informar os dados e publicar; conferir a identificação e o estado disponível. Tentar publicar sem campo obrigatório e verificar a recusa. | CA01–CA04; WS01 e WS02. |
| 3 — Listar doações disponíveis | A ONG encontra ofertas que pode reservar. | Com ofertas previamente cadastradas, consultar a lista e conferir quais estão disponíveis; verificar também o cenário sem ofertas aptas. | CA05 e CA11; WS01. |
| 4 — Garantir uma reserva por doação | Uma organização assume a reserva, evitando conflito com outras. | Com uma oferta disponível, aceitar por uma ONG, conferir sua saída da lista e tentar um segundo aceite por outra ONG, que deve ser recusado. | CA06–CA10; WS03–WS05. |

As três histórias formam o fluxo **publicar -> encontrar -> reservar**. Para demonstrar listagem ou aceite isoladamente, podem ser usadas doações previamente cadastradas. A história 2 complementa a validação da publicação; as histórias 5–7 tratam da evolução após a reserva. A história zero (★) é o recorte integrado mínimo desse fluxo, demonstrado por WS01–WS05. Os critérios CA incluem comportamentos adicionais ainda pendentes, como a verificação temporal da validade; sua presença nesta decomposição não indica implementação concluída.

### Histórias e avaliação INVEST

**INVEST:** **I — Independent (Independente):** pode ser planejada e desenvolvida com o mínimo de dependências de outras histórias; **N — Negotiable (Negociável):** permite discutir os detalhes da solução; **V — Valuable (Valiosa):** entrega valor a um stakeholder; **E — Estimable (Estimável):** tem clareza suficiente para estimar o esforço; **S — Small (Pequena):** cabe em uma iteração; **T — Testable (Testável):** possui critérios de aceite verificáveis. A tabela abaixo destaca os problemas identificados e suas ações corretivas.

| # | História (Como… quero… para…) | INVEST: o que falha | Ação corretiva |
|---|---|---|---|
| ★ | Como ONG ou cozinha comunitária, quero ver uma doação publicada e aceitá-la para reservar a retirada antes que o alimento se perca. | A candidata inicial misturava achar, aceitar e registrar retirada, então falhava em `S` e `E`. | Cortamos a fatia para publicar -> listar -> aceitar -> sair da lista; retirada, métricas e exceções ficaram fora da história zero. |
| 1 | Como doador de alimentos, quero publicar uma doação com tipo, quantidade e validade para colocar o excedente em circulação sem depender de mensagens dispersas. | A primeira redação falhava em `V`: o "para" repetia "publicar a doação". | Reescrevemos o benefício em termos de impacto no caso: reduzir atrito operacional e tempo até a ONG enxergar a oferta. |
| 2 | Como vigilância sanitária, quero que o cadastro recuse doações sem tipo, quantidade e validade para manter a rastreabilidade mínima do alimento no piloto. | A candidata falhava em `I`: tratava conformidade completa como requisito desta iteração. | Limitamos a regra ao mínimo já citado no caso e nos testes; endereço, lote e comprovantes viraram risco a validar depois. |
| 3 | Como ONG ou cozinha comunitária, quero listar as doações disponíveis e dentro da validade para decidir cedo o que consigo retirar e preparar. | A candidata falhava em `N`: incluía filtro, mapa e ordenação por distância sem evidência no caso. | Mantivemos a listagem simples; a verificação de validade proposta na RN05 ainda precisa ser implementada. |
| 4 | Como Marta, quero que uma doação aceita saia da lista pública e não possa ser aceita de novo para evitar conflito operacional entre ONGs. | A candidata falhava em `S`: escondia duas regras correlatas sem ligar isso ao mesmo valor. | Unificamos as regras porque ambas protegem a mesma consequência observável: uma reserva válida por vez. |
| 5 | Como ONG ou cozinha comunitária, quero registrar que a retirada foi concluída para encerrar a doação com rastreabilidade mínima. | A candidata falhava em `E`: assumia foto, assinatura e geolocalização. | Fatiamos para um registro manual simples de retirada; evidências mais fortes ficam para quando soubermos o custo no piloto. |
| 6 | Como Marta, quero ver o tempo entre publicação e retirada das doações concluídas para testar se o gargalo principal está mesmo na coleta. | A candidata falhava em `S` e `V`: queria um dashboard de impacto amplo demais. | Reduzimos a fatia para uma única métrica do caso, tempo entre oferta e retirada, que já permite medir a hipótese central. |
| 7 | Como ONG ou cozinha comunitária, quero sinalizar que não consegui retirar uma doação aceita dentro do prazo para disparar uma decisão operacional antes que o alimento se perca. | A candidata falhava em `N`: a regra de reofertar automaticamente a doação não existe no caso. | Mantivemos apenas o aviso de impedimento; a decisão sobre reabrir, descartar ou redirecionar ficou com a Marta. |

**A História Zero (★) é:** “Como ONG ou cozinha comunitária, quero ver uma doação publicada e aceitá-la para reservar a retirada antes que o alimento se perca.”

**História zero (★)**

**Por que ela foi escolhida:** entrega a menor fatia demonstrável do valor central do produto: tirar a doação da comunicação dispersa e permitir que uma ONG encontre e reserve uma oferta, impedindo reservas duplicadas. O fluxo publicação -> descoberta -> aceite pode ser demonstrado pelos cinco critérios WS01–WS05, com baixo custo e sem depender de logística, notificações ou indicadores completos. A escolha permite validar primeiro a coordenação da reserva; comprovar aproveitamento exige o experimento de retirada descrito adiante.

**O que ficou FORA da fatia**
- Cadastro e autenticação de doadores, ONGs e voluntários.
- Endereço detalhado, roteirização e repasse para entregadores.
- Registro de retirada, cancelamento, aviso de impedimento e reoferta (RN12–RN15), inclusive comprovação por foto, assinatura ou geolocalização.
- Notificações em tempo real e integração com WhatsApp ou SMS.
- Cálculo de refeições, dashboard de impacto e relatórios.
- Priorização entre bairros ou ONGs e reoferta automática. O aceite único em tentativas simultâneas faz parte da fatia (RN07).

**Por quê**
- Cadastro e autenticação: risco de consumir a iteração em controle de acesso antes de medir se a reserva simples já reduz o tempo entre oferta e coleta.
- Endereço, roteirização e entregadores: risco de depender de dados estruturados e de uso na rua, em celular e conexão instável, sem sabermos ainda se o piloto precisa disso para provar o núcleo.
- Registro de retirada e exceções: ficam para a evolução do piloto. A primeira iteração demonstra publicação -> descoberta -> aceite; testar a hipótese de aproveitamento exige também o registro de retirada (RN11, RN12 e RN16).
- Notificações e integrações: risco de custo e complexidade incompatíveis com o orçamento próximo de zero citado no caso.
- Impacto e relatórios: medição; antes de calcular refeições, precisamos medir se a doação sai da comunicação dispersa e entra em um fluxo confiável.
- Priorização e reoferta: risco de inventar política operacional que pertence à Marta e pode mudar no piloto de um bairro.

## Critérios de aceite

### Cinco critérios do walking skeleton

Os critérios **WS01–WS05** abaixo correspondem, um a um, aos cinco cenários de negócio em [tests/doacoes.test.js](../tests/doacoes.test.js). São o recorte mínimo dos critérios CA detalhados adiante, sem incluir validações adicionais ainda propostas. Todos os cinco testes estão declarados como `it.todo`: o vínculo existe, mas a execução automatizada desses cenários permanece pendente. O teste de saúde não integra esta contagem.

| Critério | História / critérios relacionados | Dado | Quando | Então | Teste correspondente (nome exato) |
|---|---|---|---|---|---|
| WS01 | 1 e 3 / CA01, CA05 | Um doador publicou uma doação com tipo, quantidade e validade futura, ainda não aceita. | Uma ONG consulta a lista de disponíveis. | A doação publicada aparece na lista com seus dados. | `mostra a doação publicada na lista de disponíveis` |
| WS02 | 1 e 2 / CA02 | Uma solicitação de publicação não contém um dos campos obrigatórios: tipo, quantidade ou validade. | O doador solicita a publicação, repetindo o cenário para cada campo ausente. | A publicação é recusada e nenhuma doação é criada. | `recusa doação sem os campos obrigatórios` |
| WS03 | 4 e ★ / CA06 | Uma doação está disponível e uma ONG está identificada. | A ONG aceita a doação. | O registro assume estado “aceita” e fica vinculado à ONG informada. | `marca a doação como aceita pela ONG` |
| WS04 | 3, 4 e ★ / CA05, CA06 | Uma doação publicada foi aceita por uma ONG. | A lista de disponíveis é consultada novamente. | A doação aceita não aparece na lista, mas seu registro é preservado. | `remove a doação da lista de disponíveis depois de aceita` |
| WS05 | 4 e ★ / CA07 | Uma doação já está aceita por uma ONG. | Outra ONG tenta aceitar a mesma doação. | O novo aceite é recusado e a reserva da primeira ONG permanece inalterada. | `recusa aceitar uma doação que já foi aceita por outra ONG` |

### Critérios detalhados por história

Critérios derivados das RN01–RN11; os que dependem de propostas descrevem o comportamento pretendido, ainda sujeito à validação. A situação de atendimento está em [validacao.md](validacao.md).

Os critérios estão enumerados com identificadores estáveis e vinculados explicitamente a três histórias: **1 (publicar), 3 (listar) e 4 (garantir reserva única)**. CA02 também atende à história 2. Em conjunto, publicação, descoberta e aceite compõem a história zero (★). Histórias 5–7 permanecem na evolução do piloto, fora desta cobertura.

### História 1 — Publicar uma doação

Como doador de alimentos, quero publicar uma doação com tipo, quantidade e validade para colocar o excedente em circulação sem depender de mensagens dispersas.

| Critério | Regras | Dado | Quando | Então |
|---|---|---|---|---|
| CA01 — Publicação válida | RN01, RN04 | Um doador informa tipo, quantidade positiva com unidade e validade futura válida. | Solicita a publicação. | A doação é criada com identificação única, momento da publicação e estado “disponível”, sem destinatário. |
| CA02 — Campos obrigatórios | RN01 | Um dos campos tipo, quantidade ou validade está ausente, vazio ou contém apenas espaços; os demais são válidos. | O doador solicita a publicação, repetindo o cenário para cada campo e condição. | A publicação é recusada e nenhuma doação é criada. |
| CA03 — Quantidade inválida | RN02 | A quantidade é zero, negativa ou não informa unidade; os demais campos são válidos. | O doador solicita a publicação para cada uma dessas condições. | A publicação é recusada e nenhuma doação é criada. |
| CA04 — Validade inválida | RN03 | A validade é inválida, anterior ou igual ao momento da publicação; os demais campos são válidos. | O doador solicita a publicação para cada uma dessas condições. | A publicação é recusada e nenhuma doação é criada. |

### História 3 — Listar doações disponíveis

Como ONG ou cozinha comunitária, quero listar as doações disponíveis e dentro da validade para decidir cedo o que consigo retirar e preparar.

| Critério | Regras | Dado | Quando | Então |
|---|---|---|---|---|
| CA05 — Filtrar ofertas aptas | RN05, RN09 | Existem doações disponíveis com validade futura, doações aceitas ainda dentro da validade e doações disponíveis com validade atingida ou ultrapassada. | A organização consulta a lista. | Somente as disponíveis com validade futura aparecem; aceitas e vencidas são omitidas. |
| CA11 — Nenhuma oferta apta | RN05 | Não existe doação disponível dentro da validade. | A organização consulta a lista. | A lista está vazia e a interface informa que não há doações disponíveis. |

### História 4 — Garantir uma reserva por doação

Como Marta, quero que uma doação aceita saia da lista pública e não possa ser aceita de novo para evitar conflito operacional entre ONGs.

| Critério | Regras | Dado | Quando | Então |
|---|---|---|---|---|
| CA06 — Aceite integral | RN06, RN08, RN09, RN10 | Uma doação está disponível e dentro da validade, e a organização responsável está identificada. | A organização confirma o aceite. | Toda a oferta fica vinculada a ela, assume estado “aceita” e sai da lista de disponíveis, preservando seu registro. |
| CA07 — Aceite inválido | RN05, RN06, RN07 | A doação solicitada não existe, já está aceita ou atingiu a validade. | Uma organização identificada tenta aceitá-la, em cada uma dessas condições. | O aceite é recusado, sem criar reserva ou alterar uma reserva existente. |
| CA08 — Aceites simultâneos | RN07 | Duas organizações identificadas tentam reservar a mesma doação disponível e dentro da validade. | Os pedidos de aceite são processados simultaneamente. | Somente uma reserva é concluída; a outra organização recebe informação de indisponibilidade na interface. |
| CA09 — Organização não identificada | RN08 | A doação está disponível e dentro da validade, mas o pedido não identifica a organização responsável. | O aceite é solicitado. | O pedido é recusado e a doação permanece disponível, sem destinatário. |
| CA10 — Aceite não confirma retirada | RN11 | Uma doação foi aceita e não possui confirmação de retirada. | Seu registro é consultado e, quando implementados, os indicadores são calculados. | O registro mantém estado “aceita”, sem comprovação de retirada; a doação não é contabilizada como retirada nem como refeição viabilizada. |

CA11 foi acrescentado após CA01–CA10; a organização por história preserva a numeração já referenciada nos demais documentos. Cenários temporais devem usar a mesma referência de tempo, com horário e fuso definidos conforme as pendências de RN03 e RN05.

## Riscos
**Escala utilizada:** probabilidade e impacto são classificados como **Baixo**, **Médio** ou **Alto**. A prioridade do risco resulta da combinação entre a chance de ocorrer e a gravidade de suas consequências para o piloto.

| Risco | Probabilidade | Impacto | Mitigação | Responsável | Prazo |
|---|---|---|---|---|---|
| R01 — Doadores desistirem de publicar porque o cadastro é demorado ou difícil de usar pelo celular. | Média | Alto | Manter somente tipo, quantidade e validade como campos obrigatórios; testar o formulário com pelo menos três doadores e simplificar os pontos que causarem abandono. | Marta e equipe de produto | Antes do início do piloto. |
| R02 — Uma doação ser aceita, mas não ser retirada antes da validade, impedindo que outra ONG a aproveite. | Alta | Alto | Validar janela de confirmação e alertas; acompanhar manualmente os impedimentos até implementar RN13. Eventual reoferta depende da decisão de Marta e das condições da RN14; não há expiração automática de reserva aprovada. | Marta e ONG que aceitou a doação | Regra definida antes do piloto e revisão ao fim da segunda semana. |

## Hipótese e experimento

- **Hipótese falsificável (H01):** ao fim dos **14 dias do piloto**, pelo menos **70% das doações publicadas nesse período, excluindo as canceladas, terão retirada confirmada antes da validade**.
- **Medida:** percentual de doações publicadas com retirada registrada antes da data e hora de validade.
- **Valor/data que invalida a hipótese:** a hipótese será invalidada se, ao fim da **segunda semana do piloto**, o percentual for inferior a **70%**.
- **Experimento:** realizar um piloto de 14 dias em um bairro, com doadores e ONGs participantes definidos por Marta antes do início. Registrar o início e o encerramento do período; orientar os participantes a publicar e aceitar pelo Prato Cheio. Marta acompanhará diariamente cada doação e reunirá identificação, horários de publicação e validade, organização responsável, horário da retirada confirmado pela ONG e eventual cancelamento com motivo. Ao encerrar o 14º dia, calcular o indicador e compará-lo ao limiar de 70%. Doações ainda sem retirada confirmada no encerramento permanecem no denominador, mas não no numerador, mesmo que ainda estejam dentro da validade. Esse experimento verifica o limiar de aproveitamento no período; não demonstra, isoladamente, melhora causal em relação ao processo anterior.
- **Forma de medição:** para a coorte de doações publicadas no período, calcular `(doações não canceladas com retirada confirmada antes da validade / total de doações publicadas não canceladas) × 100` (RN16). Sem doações elegíveis, apresentar “sem dados”, sem concluir aprovação ou invalidação da hipótese. Cancelamentos ficam registrados separadamente (RN15); aceite não conta como retirada (RN11).
- **Condição para executar o experimento:** a medição exige data e hora de validade e retirada e registro de cancelamentos (RN03, RN12 e RN15), ainda ausentes no sistema. Antes do piloto, esses registros precisam ser implementados ou coletados em acompanhamento manual padronizado. As métricas de impacto acima se referem a esse piloto, não à entrega atual. Estimativas de refeições seguem RN17.

## Decisão de análise
- **Problema:** definir o escopo da primeira iteração de forma que seja possível testar rapidamente se um fluxo centralizado melhora o aproveitamento das doações, sem ultrapassar o orçamento próximo de zero nem criar regras operacionais ainda não validadas.
- **Alternativa 1 — implementar o fluxo mínimo de publicação, listagem e aceite:** ganha rapidez de entrega, baixo custo e validação antecipada da proposta central; perde recursos de logística, confirmação da retirada e medição completa do impacto.
- **Alternativa 2 — implementar desde o início o fluxo completo, com cadastro, mapa, notificações, entregadores, comprovação da retirada e dashboard:** ganha maior cobertura operacional e rastreabilidade; perde simplicidade, exige mais tempo e custo e aumenta o risco de desenvolver funcionalidades sem evidência de necessidade.
- **Decisão e justificativa:** escolher a **Alternativa 1**, exigindo apenas tipo, quantidade e validade na publicação e garantindo que uma doação aceita deixe de aparecer como disponível. Essa opção entrega a menor fatia capaz de testar o valor principal do sistema e permite aprender com o piloto antes de investir em automações e integrações.
- **Complemento pelas novas regras:** RN01–RN11 detalham essa fatia, incluindo as propostas de quantidade válida, validade temporal e reserva integral. As lacunas indicadas na tabela ainda precisam de validação e implementação; RN12–RN17 permanecem na evolução do piloto.
- **Riscos e limitações:** o fluxo mínimo não garante que a retirada aconteça, depende de acompanhamento manual da Marta e não resolve roteirização, conexão instável ou comprovação física da entrega. Além disso, um piloto pequeno ou concentrado em um único bairro pode não representar o comportamento de outros doadores e ONGs.

## Uso de IA
A atualização das regras RN01–RN17 e dos trechos relacionados foi elaborada com apoio de IA a partir da documentação e da leitura do código. As propostas estão identificadas e não representam validação pelos stakeholders nem execução de testes.

A IA foi usada para gerar histórias candidatas; o grupo revisou tudo antes de aproveitar.
- `#2`: gerou "Como usuário, quero cadastrar uma doação". Mudamos para `doador de alimentos` e incluímos tipo, quantidade e validade, porque "usuário" não é stakeholder e faltava rastreabilidade mínima. Regra inventada: endereço obrigatório; decide Marta com a vigilância sanitária.
- `#6`: gerou retirada com foto e geolocalização. Reduzimos para registro manual, porque essa prova tornava a fatia grande demais para celular e conexão instável. Regra inventada: retirada só vale com geolocalização; decide Marta com as ONGs.
- `#8`: gerou reoferta automática da doação e aviso para todas as ONGs. Mantivemos só o aviso de impedimento, porque essa política não aparece no caso. Regra inventada: a doação volta sozinha para a fila; decide Marta.
