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
-Falta um dono claro para a regra "Doação aceita sai da fila pública" — quem assume a decisão final e a responsabilidade por conflitos não está definido.
-A regra não menciona atomicidade/concorrência: aceitar simultâneo por duas ONGs precisa de mecanismo transacional (lock/compare-and-swap).
"Publicação exige rastreabilidade mínima" omite formatos/valores válidos (unidades, tipo normalizado, validade em ISO), e validação server-side.
-Não há definição de exceções (ex.: doador cancela, doação parcialmente retirada, ou validade menor que janela de reserva).
-Regra de expiração em 2 horas não considera notificações, fuso horário, relógio do servidor nem extensão por aviso; precisa de owner operacional e métricas.

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
| 1 | Como doador de alimentos, quero publicar uma doação com tipo, quantidade e validade para colocar o excedente em circulação sem depender de mensagens dispersas. | A primeira redação falhava em `V`: o "para" repetia "publicar a doação". | Reescrevemos o benefício em termos de impacto no caso: reduzir atrito operacional e tempo até a ONG enxergar a oferta. |
| 2 | Como vigilância sanitária, quero que o cadastro recuse doações sem tipo, quantidade e validade para manter a rastreabilidade mínima do alimento no piloto. | A candidata falhava em `I`: tratava conformidade completa como requisito desta iteração. | Limitamos a regra ao mínimo já citado no caso e nos testes; endereço, lote e comprovantes viraram risco a validar depois. |
| 3 | Como ONG ou cozinha comunitária, quero listar as doações disponíveis para decidir cedo o que consigo retirar e preparar. | A candidata falhava em `N`: incluía filtro, mapa e ordenação por distância sem evidência no caso. | Mantivemos só a listagem simples das disponíveis, suficiente para demonstrar a descoberta da oferta no celular. |
| 4 | Como Marta, quero que uma doação aceita saia da lista pública e não possa ser aceita de novo para evitar conflito operacional entre ONGs. | A candidata falhava em `S`: escondia duas regras correlatas sem ligar isso ao mesmo valor. | Unificamos as regras porque ambas protegem a mesma consequência observável: uma reserva válida por vez. |
| 5 | Como ONG ou cozinha comunitária, quero registrar que a retirada foi concluída para encerrar a doação com rastreabilidade mínima. | A candidata falhava em `E`: assumia foto, assinatura e geolocalização. | Fatiamos para um registro manual simples de retirada; evidências mais fortes ficam para quando soubermos o custo no piloto. |
| 6 | Como Marta, quero ver o tempo entre publicação e retirada das doações concluídas para testar se o gargalo principal está mesmo na coleta. | A candidata falhava em `S` e `V`: queria um dashboard de impacto amplo demais. | Reduzimos a fatia para uma única métrica do caso, tempo entre oferta e retirada, que já permite medir a hipótese central. |
| 7 | Como ONG ou cozinha comunitária, quero sinalizar que não consegui retirar uma doação aceita dentro do prazo para disparar uma decisão operacional antes que o alimento se perca. | A candidata falhava em `N`: a regra de reofertar automaticamente a doação não existe no caso. | Mantivemos apenas o aviso de impedimento; a decisão sobre reabrir, descartar ou redirecionar ficou com a Marta. |

## Critérios de aceite
**História X** — Dado … Quando … Então …

## Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|

## Hipótese e experimento

## Decisão de análise
- **Problema:**
- **Alternativas:**
- **Decisão e justificativa:**
- **Riscos e limitações:**

## Uso de IA
A IA foi utilizada apenas para consulta, esclarecimento de conceitos, compreensão das orientações da atividade e revisão da clareza, coerência e formatação do documento. As sugestões recebidas foram analisadas criticamente pelo grupo antes de serem aplicadas.
