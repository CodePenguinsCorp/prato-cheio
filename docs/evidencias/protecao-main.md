# Evidência de proteção da `main`

## Estado da evidência

**Pendente de captura no primeiro Pull Request do grupo.** Este arquivo não deve afirmar que a proteção está ativa antes da conferência das regras no GitHub.

Repositório: [`CodePenguinsCorp/prato-cheio`](https://github.com/CodePenguinsCorp/prato-cheio)

## Configuração exigida

A regra aplicada à branch `main` deve exigir:

- Pull Request antes do merge;
- pelo menos **1 aprovação** de outro integrante;
- aprovação de novas alterações após mudanças no PR (stale approvals);
- conversa resolvida antes do merge;
- check obrigatório **`build-e-testes`**, definido em `.github/workflows/ci.yml`;
- branch atualizada com a `main` antes do merge;
- bloqueio de force push e de exclusão da branch;
- aplicação da regra também aos administradores, se o plano/permissões do repositório oferecer essa opção.

## Evidências a registrar antes do merge

| Evidência | Link ou registro |
|---|---|
| URL da regra/ruleset da `main` | Pendente |
| Captura da tela com as exigências acima | Pendente — adicionar em `docs/evidencias/` e referenciar aqui |
| URL do primeiro Pull Request do grupo | Pendente |
| Check `build-e-testes` verde nesse PR | Pendente |
| Aprovação de integrante diferente do autor | Pendente |

## Critério de conclusão

Esta evidência só está completa quando os cinco registros da tabela estiverem preenchidos e o primeiro PR tiver sido integrado sem bypass. Se alguma opção não estiver disponível no plano do GitHub, registrar a limitação e a compensação adotada, sem marcar a exigência como atendida.
