# Roteiro da demo — Prato Cheio

*Trabalho 3 · 3 minutos · outra pessoa precisa conseguir reproduzir só lendo isto*

## Antes de começar

Requisitos: Node.js 22.13 ou superior e Docker (ou outro PostgreSQL acessível por `DATABASE_URL`). Os comandos abaixo usam Bash; a configuração equivalente para PowerShell está logo depois.

A partir de um clone novo da branch deste PR:

```bash
git clone --branch docs/entrega-aula-13 https://github.com/CodePenguinsCorp/prato-cheio.git
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

## Roteiro (3 minutos)

| Tempo | O que mostrar | O que se prova |
|---|---|---|
| 0:00–0:20 | **Problema:** doadores e ONGs combinam retirada de alimento por canais dispersos, e comida própria para consumo é descartada antes da coleta. | por que o produto existe |
| 0:20–1:50 | **História:** o doador publica uma doação (tipo, quantidade, validade), ela aparece na lista, a ONG aceita e ela sai da lista. Banco: PostgreSQL. | o produto executa ponta a ponta |
| 1:50–2:30 | **Erro tratado:** publicar sem quantidade é recusado; aceitar uma doação já aceita por outra ONG é recusado. | o limite foi pensado (CA-02, CA-05) |
| 2:30–3:00 | **O que falta:** registrar a retirada, tratar doação aceita e não retirada (ADR 0003, sem reoferta automática), áreas do doador e da ONG, medir tempo até a retirada. | sabemos onde estamos |

## Passo a passo reproduzível

Abra <http://localhost:3000> no navegador.

1. **Ação:** abra a página inicial. **Resultado esperado:** aparece o formulário de publicação e a lista de doações disponíveis vazia, com o contador de disponíveis em 0.
2. **Ação:** no formulário, digite `Pães` em tipo, `20 unidades` em quantidade e escolha uma validade futura (ex.: amanhã). Clique em **Publicar doação**. **Resultado esperado:** aviso verde "Doação publicada e disponível para as organizações." e o cartão "Pães, 20 unidades" aparece na lista, com o contador em 1 (CA-01).
3. **Ação:** publique uma segunda doação: `Frutas`, `10 porções`, validade futura. **Resultado esperado:** a lista mostra as duas doações.
4. **Ação (caso de erro 1):** limpe o formulário, preencha só tipo `Arroz` e validade, deixe a quantidade vazia e clique em **Publicar doação**. **Resultado esperado:** a publicação é recusada: o campo quantidade fica marcado com "Informe a quantidade disponível." e nenhuma doação nova entra na lista (CA-02).
5. **Ação:** no campo do nome da ONG, digite `Cozinha Solidária` e clique em **Aceitar doação** no cartão "Pães". **Resultado esperado:** aviso "Doação de Pães reservada para Cozinha Solidária." e o cartão "Pães" some da lista; resta só "Frutas" e o contador vai a 1 (CA-03, CA-04).
6. **Ação (caso de erro 2, pela API):** em um terminal Bash, rode (troque `1` pelo id da doação de Pães, que é a primeira criada em banco novo):

   ```bash
   curl -i -X POST http://localhost:3000/api/doacoes/1/aceitar -H "Content-Type: application/json" -d '{"ong":"Outra ONG"}'
   ```

   **Resultado esperado:** `HTTP/1.1 400` e corpo `{"erro":"doação já foi aceita"}`. A doação continua com a Cozinha Solidária (CA-05).
7. **Ação (opcional, prova da regra):** no mesmo terminal Bash, `curl -i -X POST http://localhost:3000/api/doacoes -H "Content-Type: application/json" -d '{"tipo":"Leite","quantidade":"5 caixas"}'`. **Resultado esperado:** `HTTP/1.1 400` e `{"erro":"validade é obrigatório"}`.
8. **Ação:** `curl http://localhost:3000/api/saude`. **Resultado esperado:** `{"ok":true}`.
9. **Ação (provas automatizadas):** `npm test` com `TEST_DATABASE_URL` apontando para um banco **descartável** (os testes apagam as doações). **Resultado esperado:** a suíte passa inteira (15 testes, incluindo CA-01 a CA-05). Atenção: não aponte para o banco da demo.

## Testado por

- **Responsável pela validação:** André Schultz, com execução assistida pelo Codex em **24/11/2026**, a seu pedido. Esta sessão usou um clone novo do commit `8d6e5fd`, Node.js 22.14.0 e PostgreSQL 18.3 local, com bancos descartáveis separados para demo e testes. A aplicação foi acessada em `http://localhost:3101` (`PORT=3101`).
- **Resultado observado:** passos 1 a 5 executados pela interface; passos 6 a 8 conferidos pela API; passo 9 com **15 testes passando**. As doações finais e a associação à primeira ONG foram conferidas diretamente no banco. Veja a [evidência da execução](evidencias/validacao-aula-13.md).
- **Correções do roteiro:** aguardar a prontidão do PostgreSQL, instalar pelo lockfile com `npm ci`, separar o banco dos testes, explicitar as variáveis por terminal e a branch do PR. O fluxo da aplicação não precisou de alteração.
- **Execução independente:** ainda não realizada por outro integrante sem ajuda. A validação assistida acima não substitui esse requisito da atividade. Após a execução manual, registrar nome, data real e eventuais correções nesta seção.
