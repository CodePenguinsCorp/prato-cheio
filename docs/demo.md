# Roteiro da demo — Prato Cheio

*Trabalho 3 · 3 minutos · outra pessoa precisa conseguir reproduzir só lendo isto*

## Antes de começar

Requisitos: Node.js 22.13 ou superior e Docker (ou outro PostgreSQL acessível por `DATABASE_URL`).

A partir de um clone novo:

```bash
git clone https://github.com/CodePenguinsCorp/prato-cheio.git
cd prato-cheio
docker run -d --name pratocheio-pg -e POSTGRES_USER=pratocheio -e POSTGRES_PASSWORD=pratocheio -e POSTGRES_DB=pratocheio -p 5432:5432 postgres:16-alpine
export DATABASE_URL=postgres://pratocheio:pratocheio@localhost:5432/pratocheio
npm install
npm run db:migrar
npm start
```

No PowerShell, troque o `export` por `$env:DATABASE_URL = "postgres://pratocheio:pratocheio@localhost:5432/pratocheio"`.

- **O que precisa estar no ar:** o PostgreSQL (contêiner acima) antes do `npm run db:migrar`.
- **Variável de ambiente:** `DATABASE_URL` (modelo em `.env.example`). Os mesmos comandos estão no README.
- **Resultado esperado:** `npm run db:migrar` imprime `schema criado`; `npm start` sobe em <http://localhost:3000>.
- Para repetir a demo do zero, a lista começa vazia em um banco novo (`docker rm -f pratocheio-pg` e suba de novo).

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
6. **Ação (caso de erro 2, pela API):** em um terminal, rode (troque `1` pelo id da doação de Pães, que é a primeira criada em banco novo):

   ```bash
   curl -i -X POST http://localhost:3000/api/doacoes/1/aceitar -H "Content-Type: application/json" -d '{"ong":"Outra ONG"}'
   ```

   **Resultado esperado:** `HTTP/1.1 400` e corpo `{"erro":"doação já foi aceita"}`. A doação continua com a Cozinha Solidária (CA-05).
7. **Ação (opcional, prova da regra):** no mesmo terminal, `curl -i -X POST http://localhost:3000/api/doacoes -H "Content-Type: application/json" -d '{"tipo":"Leite","quantidade":"5 caixas"}'`. **Resultado esperado:** `HTTP/1.1 400` e `{"erro":"validade é obrigatório"}`.
8. **Ação:** `curl http://localhost:3000/api/saude`. **Resultado esperado:** `{"ok":true}`.
9. **Ação (provas automatizadas):** `npm test` com `TEST_DATABASE_URL` apontando para um banco **descartável** (os testes apagam as doações). **Resultado esperado:** a suíte passa inteira (15 testes, incluindo CA-01 a CA-05). Atenção: não aponte para o banco da demo.

## Testado por

Outro integrante executou este roteiro sem ajuda: **[PREENCHER: nome de quem NÃO escreveu o roteiro]**, em **19/11/2026**.
O que precisou ser corrigido depois que ele o executou: **[PREENCHER, ou "nada precisou mudar"]**.
