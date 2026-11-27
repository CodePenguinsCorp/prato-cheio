# Prato Cheio - CodePenguins

Projeto da disciplina **Análise, Projeto e Desenvolvimento Ágil**.
Conecta doadores de alimentos excedentes a ONGs, antes que a comida se perca.

> Este repositório é a base do produto que evolui nas três unidades:
> walking skeleton (U1) → incremento guiado pelo projeto (U2) → produto refatorado (U3).

## Integrantes

- André Schultz - @andreschultzz
- José Henrique Brühmüller - @JHBruhmuller
- Matheus Büsemayer - @pixelbananas
- Lucas Monich Nunes - @luhrt

## Como rodar

Requisitos: **Node.js 22.13 ou superior** e um **PostgreSQL** (o exemplo usa Docker). O app usa um banco e os testes usam **outro**, descartável.

```bash
docker run -d --name pratocheio-pg -e POSTGRES_USER=pratocheio -e POSTGRES_PASSWORD=pratocheio -e POSTGRES_DB=pratocheio -p 5432:5432 postgres:16-alpine
docker exec pratocheio-pg pg_isready -U pratocheio -d pratocheio   # repita até "accepting connections"
docker exec pratocheio-pg createdb -U pratocheio pratocheio_testes
```

A senha acima é só do banco local de exemplo; nunca versione a senha de um banco real. Defina as variáveis em cada terminal (os scripts **não** leem o arquivo `.env`; o `.env.example` é só referência):

```bash
export DATABASE_URL=postgres://pratocheio:pratocheio@localhost:5432/pratocheio
export TEST_DATABASE_URL=postgres://pratocheio:pratocheio@localhost:5432/pratocheio_testes
```

No PowerShell:

```powershell
$env:DATABASE_URL = 'postgres://pratocheio:pratocheio@localhost:5432/pratocheio'
$env:TEST_DATABASE_URL = 'postgres://pratocheio:pratocheio@localhost:5432/pratocheio_testes'
```

Os três comandos:

```bash
npm install   # só na primeira vez
npm test      # roda os testes no banco de TEST_DATABASE_URL
npm start     # cria ou atualiza o schema e sobe em http://localhost:3000
```

Também existem `npm run db:migrar` (só o schema, sem subir o servidor) e `npm run dev` (recarrega a cada alteração). A migração só acrescenta colunas: as doações já gravadas são preservadas. Para abrir no celular, conecte-o à mesma rede e acesse `http://IP-DO-COMPUTADOR:3000` (o firewall precisa permitir a conexão).

Os testes **apagam as doações e recriam a tabela** do banco apontado por `TEST_DATABASE_URL`: use um banco descartável, nunca o do piloto nem o da demo. Fora do CI, `DATABASE_URL` não é usado pelos testes; no CI ele é o serviço PostgreSQL descartável do job.

> Esta é a **stack preferencial** da disciplina. Se o seu grupo optar por outra, registre o ADR de justificativa e garanta os mesmos compromissos: repositório público com CI verde, rota de saúde, testes por um comando, os três comandos documentados aqui no README e banco relacional migrado para PostgreSQL na Unidade 3.

## O banco: SQLite até a Unidade 2, PostgreSQL agora

| Unidade        | Banco                                | O que precisa instalar                                 |
| -------------- | ------------------------------------ | ------------------------------------------------------ |
| 1 — Análise    | **SQLite** (`node:sqlite`, embutido) | nada além do Node                                      |
| 2 — Projeto    | SQLite                               | nada                                                   |
| 3 — Construção | **PostgreSQL** (migrado)             | um PostgreSQL acessível — o caminho é escolha do grupo |

A troca não é acidente de percurso: na Unidade 2 vocês registram a decisão em um **ADR** (alternativas, consequências, riscos) e na Unidade 3 executam a **refatoração** — com os testes existentes provando que o comportamento se manteve.

O `src/db.js` foi desenhado para isso: ele expõe `query()` devolvendo `{ rows }`, então a troca do banco fica contida nele e não vaza para as regras de negócio.

**Como o PostgreSQL vai subir é decisão do grupo**, comparada no mesmo ADR: instalar o PostgreSQL na máquina, subir um contêiner, ou usar um serviço gerenciado gratuito (Neon, Supabase, Render). A disciplina não impõe o caminho — exige o banco alcançável por `DATABASE_URL`, o schema migrado e o CI verde. Cada opção tem custo e risco diferentes, e reconhecê-los é parte da decisão.

## Estrutura

```
src/server.js        entrypoint (npm start)
src/db.js            conexão e schema do banco (pronto)
src/app.js           rotas da API
src/doacoes.js       regras de negócio
src/repositorio.js   acesso ao banco (SQL)
public/index.html    interface (funciona no celular)
tests/               testes automatizados
docs/analise.md      documento de análise   (Trabalho 1)
docs/projeto.md      documento de projeto   (Trabalho 2)
docs/adr/            decisões arquiteturais (Trabalho 2)
docs/validacao.md    validação e testes     (Trabalho 3)
docs/refatoracoes.md refatorações feitas    (Trabalho 3)
docs/demo.md         roteiro da demo        (Trabalho 3)
docs/retrospectivas/ retrospectiva de cada iteração
.github/workflows/   pipeline de CI
```

## Como trabalhar (fluxo de Pull Request)

A partir da Unidade 2, **nada entra direto na `main`**:

```bash
git checkout -b historia/ong-aceita-doacao
# ... implementa, escreve o teste, roda npm test ...
git commit -m "ONG aceita uma doação e ela sai da lista"
git push -u origin historia/ong-aceita-doacao
```

Abra o Pull Request no GitHub, preencha o template, espere o **CI ficar verde** e
peça a revisão de **outro integrante**. Só então faça o merge.

## O que o produto faz

Uma doação tem três estados: `disponivel`, `aceita` e `coletada`. As transições permitidas são:

```text
disponivel --aceitar--> aceita --confirmar coleta--> coletada
disponivel <--devolver-- aceita
```

Qualquer outra transição é recusada com mensagem e a doação não muda ([decisões de projeto](docs/projeto.md#decisões-de-projeto)).

| Rota | O que faz |
|---|---|
| `POST /api/doacoes` | publica (`tipo`, `quantidade`, `validade`, `doador`) |
| `GET /api/doacoes` | lista as disponíveis |
| `POST /api/doacoes/:id/aceitar` | aceite pela ONG (`ong`) |
| `POST /api/doacoes/:id/coletar` | confirma a coleta (`voluntario`) |
| `POST /api/doacoes/:id/devolver` | devolve à lista (`ong`, `motivo`) |
| `GET /api/minhas-doacoes?doador=` | doações de um doador e a situação de cada uma |
| `GET /api/doacoes-da-ong?ong=` | doações aceitas e coletadas de uma ONG |
| `GET /api/resultado?mes=AAAA-MM` | resultado das doações publicadas no mês |
| `GET /api/saude` | verificação de saúde |

Os critérios de aceite estão automatizados em `tests/`. Não há login: as pessoas são identificadas pelo nome digitado (veja as [limitações](docs/validacao.md#limitações-do-produto)).

## Definição de pronto

Uma mudança só está pronta quando:

| # | Item | Onde se confere |
|:--:|---|---|
| 1 | Cada critério de aceite tem um `it` com o nome da regra, e a história tem ao menos um caso limite ou de erro. | `tests/` e o diff do PR |
| 2 | A suíte passa sobre PostgreSQL, localmente e no CI. | aba *Checks* do PR (`build-e-testes`) |
| 3 | Outro integrante revisou e aprovou, com as conversas resolvidas. | aba *Conversation* do PR |
| 4 | Regra em `src/doacoes.js`, SQL em `src/repositorio.js`, rota em `src/app.js`; tipos do banco são tratados abaixo do contrato. | diff do PR |
| 5 | A tela funciona no celular, e o roteiro e o quadro de validação foram atualizados. | `docs/demo.md` e `docs/validacao.md` |
| 6 | A descrição do PR preenche todas as seções do template. | descrição do PR ([template](.github/pull_request_template.md)) |

## Histórias do Trabalho 3: donos e revisores

| História | Dono | Revisor |
|---|---|---|
| H1: o doador acompanha as suas doações | José (@JHBruhmuller) | @luhrt |
| H2: o voluntário confirma a coleta | André (@andreschultzz) | @busemayer |
| H3: a ONG devolve uma doação aceita (e Refatoração 2) | Lucas (@luhrt) | @busemayer |
| H4: a Marta vê o resultado do mês | Matheus (@busemayer) | @JHBruhmuller |
| Fechamento | Grupo | Grupo |

## Diagramas do projeto

O [contexto](docs/diagramas/contexto.md) e o [modelo de dados](docs/diagramas/dados.md)
incluem imagens PNG para leitura direta no repositório e a fonte editável em PlantUML.
Depois de alterar um bloco PlantUML, atualize as duas imagens com:

```bash
npm run docs:diagramas -- "caminho/para/plantuml.jar"
```

A geração requer Java e o [PlantUML 1.2026.9](https://github.com/plantuml/plantuml/releases/tag/v1.2026.9).
Essas ferramentas são necessárias apenas para gerar as imagens. O comando verifica
a sintaxe antes de renderizar e usa arquivos temporários fora do repositório.
Inclua a fonte Markdown e a imagem atualizada no mesmo PR.

## Uso de IA

A IA pode participar da produção, mas o grupo é responsável por verificar, testar,
corrigir e **defender** o resultado. Registre em cada Pull Request o que foi gerado
com IA e o que vocês alteraram.
