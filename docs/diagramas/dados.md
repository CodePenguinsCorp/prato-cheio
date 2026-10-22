# Diagrama de dados

**Pergunta:** quais dados de doação são persistidos atualmente?

**Fonte:** schema criado por `migrar()` em `src/db.js`; operações em `src/repositorio.js`.

```plantuml
@startuml
hide methods
hide stereotypes
entity "doacoes" as doacoes {
  * id : INTEGER <<PK, AUTOINCREMENT>>
  --
  * tipo : TEXT <<NOT NULL>>
  * quantidade : TEXT <<NOT NULL>>
  * validade : TEXT <<NOT NULL>>
  * status : TEXT <<NOT NULL, DEFAULT 'disponivel'>>
  ong : TEXT <<NULL permitido>>
  * criada_em : TEXT <<NOT NULL, DEFAULT datetime('now')>>
}
note right of doacoes
  tipo, quantidade e validade são dados
  mínimos da publicação (RN-01).
  status e ong controlam o aceite (RN-02/RN-03).
end note
@enduml
```

`src/db.js` cria somente a tabela `doacoes`. Não existem relacionamentos entre tabelas: `ong` é uma coluna de texto, não uma chave estrangeira. Os atributos representados são exatamente os sete do schema. `id` é chave primária autoincremental; `tipo`, `quantidade`, `validade`, `status` e `criada_em` são `NOT NULL`; `ong` aceita `NULL`. O status padrão é `disponivel` e `criada_em` recebe `datetime('now')`.

Na inserção, o repositório grava tipo, quantidade e validade; o banco fornece os padrões de `status`, `ong` (nulo) e `criada_em`. Antes do aceite, portanto, `status='disponivel'` e `ong=NULL`. `aceitar(id, ong)` executa um único `UPDATE` condicionado a `id` e `status='disponivel'`: após o aceite, `status='aceita'` e `ong` recebe o nome informado. Um segundo aceite não altera a linha, porque o status já não satisfaz a condição; o repositório não retorna linha nesse caso.

Os dados ligados às regras de negócio são **tipo**, **quantidade** e **validade** (publicação obrigatória) e **status** e **ong** (disponibilidade e aceite exclusivo). Não há tabelas ou colunas implementadas para cadastro de doador, retirada, endereço ou histórico.
