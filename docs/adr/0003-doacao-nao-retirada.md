# ADR 0003 - Tratar doação aceita e não retirada sem reoferta automática

- **Data:** 2026-09-18
- **Status:** proposto

## Contexto

A Unidade 1 classifica como alto o risco de uma ONG aceitar a doação e não retirá-la. As RN-04 e RN-05 registram que o caso ainda não define prazo, responsável ou autorização para recolocar automaticamente a oferta na lista. Uma automação prematura pode criar uma segunda promessa sobre alimento ainda reservado.

## Alternativas consideradas

1. **Tratamento manual da exceção** - registrar que a retirada não ocorreu e manter a doação fora da lista até decisão da Marta. Evita inventar prazo e permite colher dados no piloto, mas exige acompanhamento operacional.
2. **Expiração e reoferta automáticas** - após um prazo configurado, cancelar a reserva e tornar a doação disponível novamente. Reduz trabalho manual, mas exige prazo validado, notificação às partes e confirmação de que o alimento ainda pode circular.

## Decisão

Adotar provisoriamente a alternativa 1. O piloto deve medir frequência e tempo dos casos não retirados. A equipe revisará este ADR com Marta e as ONGs antes de introduzir expiração automática.

## Consequências

- **Positivas:** não cria política ausente no caso; evita dupla destinação; gera evidência para uma decisão posterior.
- **Negativas:** Marta e as ONGs precisam acompanhar exceções; a doação pode permanecer indisponível por mais tempo.
- **Riscos e resposta:** o acompanhamento manual pode falhar; registrar responsável e horário do contato no piloto e revisar os dados ao final dos 14 dias.

## Rastreabilidade

Responde às **RN-04** e **RN-05** e ao risco da Unidade 1 “doação ser aceita e não retirada no prazo”, classificado com probabilidade alta e impacto alto.
