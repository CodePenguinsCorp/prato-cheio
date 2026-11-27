# Roteiro da demo — Prato Cheio

*Trabalho 3 · 3 minutos · outra pessoa precisa conseguir reproduzir só lendo isto*

## Antes de começar

Requisitos: Node.js 22.13 ou superior e Docker (ou outro PostgreSQL acessível por `DATABASE_URL`). Os comandos abaixo usam Bash; a configuração equivalente para PowerShell está logo depois.

A partir de um clone novo da branch de entrega:

```bash
git clone --branch entrega-3 https://github.com/CodePenguinsCorp/prato-cheio.git
cd prato-cheio
docker run -d --name pratocheio-pg -e POSTGRES_USER=pratocheio -e POSTGRES_PASSWORD=pratocheio -e POSTGRES_DB=pratocheio -p 5432:5432 postgres:16-alpine
docker exec pratocheio-pg pg_isready -U pratocheio -d pratocheio
```

Só continue quando a última linha informar `accepting connections`; enquanto o banco inicializa, repita o comando `pg_isready`. Em um contêiner novo, crie um banco separado para os testes:

```bash
docker exec pratocheio-pg createdb -U pratocheio pratocheio_testes
export DATABASE_URL=postgres://pratocheio:pratocheio@localhost:5432/pratocheio
export TEST_DATABASE_URL=postgres://pratocheio:pratocheio@localhost:5432/pratocheio_testes
npm ci
npm run db:migrar
npm start
```

Se o contêiner já existir, inicie-o com `docker start pratocheio-pg`, confira a prontidão e reutilize o banco de testes se ele já tiver sido criado. Não remova um contêiner que contenha dados que precisam ser preservados.

No PowerShell, substitua as duas linhas `export` por:

```powershell
$env:DATABASE_URL = 'postgres://pratocheio:pratocheio@localhost:5432/pratocheio'
$env:TEST_DATABASE_URL = 'postgres://pratocheio:pratocheio@localhost:5432/pratocheio_testes'
```

- **O que precisa estar no ar:** o PostgreSQL antes de `npm run db:migrar`.
- **Variáveis:** defina-as em cada terminal usado. Os scripts não carregam `.env` automaticamente; `.env.example` é uma referência de configuração.
- **Resultado esperado:** `npm run db:migrar` imprime `schema criado`; `npm start` sobe em <http://localhost:3000>.
- **Testes:** em outro terminal, defina `TEST_DATABASE_URL` com a URL acima e execute `npm test`. A suíte apaga somente o conteúdo do banco de testes configurado; não use a URL da demo nem a do piloto.
- **Estado inicial:** use um banco novo e vazio para reproduzir a lista e os contadores abaixo. Um banco reutilizado conserva as doações anteriores.
- **No celular:** conecte-o à mesma rede do computador e abra `http://IP-DO-COMPUTADOR:3000` (o firewall precisa permitir). Sem isso, use o modo de dispositivo do navegador com 360 px de largura e registre que não foi um celular real.

## Roteiro (3 minutos)

| Tempo | O que mostrar | Passos |
|---|---|---|
| 0:00–0:20 | **Problema:** doadores e ONGs combinam a retirada por canais dispersos, e comida boa é descartada antes da coleta. | 1 |
| 0:20–1:50 | **A vida de uma doação:** publicada, aceita e coletada; e uma devolvida. O doador acompanha. | 2 a 9 |
| 1:50–2:35 | **Resultado do mês e erro tratado:** devolver sem motivo é recusado. | 8 e 10 |
| 2:35–3:00 | **O que falta:** login, aviso e prazo para doação não retirada, histórico de devoluções e medir retiradas antes da validade. | — |

## Passo a passo reproduzível

Use um banco novo e vazio. Abra o produto no navegador do celular. As seções ficam uma abaixo da outra.

1. **Ação:** abra a página inicial. **Esperado:** formulário de publicação, lista vazia e contador 0.
2. **Ação:** em **Publique uma doação**, preencha nome `Padaria Pão Bom`, tipo `Pães`, quantidade `20 unidades`, validade amanhã e toque em **Publicar doação**. **Esperado:** aviso "Doação publicada e disponível para as organizações." e o cartão "Pães" na lista; contador 1.
3. **Ação:** publique `Frutas`, `10 porções`, validade amanhã (o nome continua preenchido). **Esperado:** duas doações; contador 2.
4. **Ação:** apague o nome do doador, preencha tipo `Arroz`, quantidade `2 kg`, validade amanhã e toque em **Publicar doação**. **Esperado:** "Informe quem está doando."; nada é publicado. Depois, recarregue a página.
5. **Ação:** em **Doações disponíveis**, digite a organização `Casa Esperança` e toque em **Aceitar doação** em "Pães" e depois em "Frutas". **Esperado:** cada uma some da lista, o contador chega a 0 e as duas aparecem em **Doações da organização** como "Aceita por Casa Esperança".
6. **Ação:** em **Minhas doações**, digite `Padaria Pão Bom` e toque em **Ver minhas doações**. **Esperado:** só as duas doações da padaria, ambas "Aceita por Casa Esperança".
7. **Ação:** em **Doações da organização**, no cartão "Pães", digite `Rui` em **Nome de quem coletou** e toque em **Confirmar coleta**. **Esperado:** "Coleta de Pães confirmada."; o cartão mostra "Coletada para Casa Esperança" e "Coletada por Rui em" com data e hora, sem botões.
8. **Ação:** no cartão "Frutas", deixe o motivo vazio e toque em **Devolver doação**. **Esperado:** aviso "motivo é obrigatório" e nada muda. Depois, digite `sem voluntário hoje` e toque de novo. **Esperado:** "Doação de Frutas devolvida. Ela voltou para a lista."; "Frutas" reaparece nas disponíveis, sem ONG e sem o motivo; contador 1.
9. **Ação:** confira **Minhas doações** (atualizada sozinha). **Esperado:** "Pães" coletada por Rui; "Frutas" disponível, com "Devolvida por uma organização. Motivo: sem voluntário hoje".
10. **Ação:** em **Resultado do mês**, mantenha o mês atual e toque em **Ver resultado**. **Esperado:** publicadas 2, aceitas 1, coletadas 1 e tempo médio `0 h` (a coleta foi minutos depois da publicação; se passarem 3 minutos ou mais, aparece `0,1 h`). Escolha um mês sem doações, como janeiro de 2026. **Esperado:** 0, 0, 0 e "sem coletas no mês".
11. **Ação (regras pela API, em Bash no computador; em banco novo, Pães é a doação 1):**

   ```bash
   curl -s -X POST http://localhost:3000/api/doacoes/1/devolver -H "Content-Type: application/json" -d '{"ong":"Casa Esperan\u00e7a","motivo":"teste"}'
   curl -s -X POST http://localhost:3000/api/doacoes/2/coletar -H "Content-Type: application/json" -d '{"voluntario":"Rui"}'
   curl -s -X POST http://localhost:3000/api/doacoes/1/aceitar -H "Content-Type: application/json" -d '{"ong":"Outra ONG"}'
   curl -s -X POST http://localhost:3000/api/doacoes/2/aceitar -H "Content-Type: application/json" -d '{"ong":"Casa Esperan\u00e7a"}'
   curl -s -X POST http://localhost:3000/api/doacoes/2/devolver -H "Content-Type: application/json" -d '{"ong":"Outra ONG","motivo":"teste"}'
   ```

   **Esperado, na ordem:** `{"erro":"doação já coletada não pode ser devolvida"}`; `{"erro":"só uma doação aceita pode ter a coleta confirmada"}`; `{"erro":"doação já foi aceita"}`; a doação 2 aceita pela Casa Esperança; `{"erro":"só a ONG que aceitou pode devolver a doação"}`. O `\u00e7` é o "ç" escrito em ASCII, para o terminal não trocar o caractere.
12. **Ação:** `npm test` com `TEST_DATABASE_URL` apontando para o banco de testes. **Esperado:** 58 testes passando.

## Testado por

- **Nome:** Matheus Büsemayer
- **Data:** 26/11/2026
- **Aparelho e navegador:** navegador do notebook (não foi testado em celular)
- **O que precisou ser corrigido:** nada precisou mudar

### Registro anterior (roteiro da Aula 13, versão anterior do produto)

- **Responsável pela validação:** André Schultz, com execução assistida pelo Codex em **24/11/2026**, a seu pedido. Esta sessão usou um clone novo do commit `8d6e5fd`, Node.js 22.14.0 e PostgreSQL 18.3 local, com bancos descartáveis separados para demo e testes. A aplicação foi acessada em `http://localhost:3101` (`PORT=3101`).
- **Resultado observado:** passos 1 a 5 executados pela interface; passos 6 a 8 conferidos pela API; passo 9 com **15 testes passando**. As doações finais e a associação à primeira ONG foram conferidas diretamente no banco. Veja a [evidência da execução](evidencias/validacao-aula-13.md).
- **Correções do roteiro:** aguardar a prontidão do PostgreSQL, instalar pelo lockfile com `npm ci`, separar o banco dos testes, explicitar as variáveis por terminal e a branch do PR. O fluxo da aplicação não precisou de alteração.
- **Execução independente:** em 24/11 ainda não havia sido feita; o registro atual está acima.
