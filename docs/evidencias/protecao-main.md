# Evidência de proteção da `main`

## Estado da proteção

**Ativa**, conforme verificação do grupo em **19/09/2026**.

Repositório: [`CodePenguinsCorp/prato-cheio`](https://github.com/CodePenguinsCorp/prato-cheio)

Configuração: [`Settings > Branches`](https://github.com/CodePenguinsCorp/prato-cheio/settings/branches) — visível para integrantes com permissão administrativa.

## Captura da configuração

![Ruleset ativo aplicado à branch main, sem usuários na lista de bypass](./protecao-main.png)

A captura mostra o ruleset `block-commit-main` ativo, aplicado à branch padrão `main` e sem atores autorizados a ignorar as regras pela lista de bypass.

## Controles ativos

A regra aplicada à branch `main` exige:

- Pull Request antes do merge;
- pelo menos **1 aprovação** de outro integrante;
- aprovação de novas alterações após mudanças no PR (stale approvals);
- conversa resolvida antes do merge;
- check obrigatório **`build-e-testes`**, definido em `.github/workflows/ci.yml`;
- branch atualizada com a `main` antes do merge;
- bloqueio de force push e de exclusão da branch;
- aplicação da regra também aos administradores, se o plano/permissões do repositório oferecer essa opção.

## Entrega da evidência

Este documento faz parte da branch `docs/decisoes-projeto-protecao-main` e será entregue pelo primeiro Pull Request do grupo para a Unidade 2.

| Evidência                                  | Link ou registro                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Proteção da branch `main`                  | **Ativa em 19/09/2026** — [captura](./protecao-main.png) e [configuração do repositório](https://github.com/CodePenguinsCorp/prato-cheio/settings/branches) |
| Branch que entrega esta evidência          | [`docs/decisoes-projeto-protecao-main`](https://github.com/CodePenguinsCorp/prato-cheio/tree/docs/decisoes-projeto-protecao-main) |
| URL do primeiro Pull Request do grupo      | Preencher após a abertura do PR                                                                           |
| Check `build-e-testes` nesse PR            | Confirmar após a execução do CI                                                                           |
| Aprovação de integrante diferente do autor | Confirmar antes do merge                                                                                   |

## Critério de conclusão

A proteção da `main` já está configurada. A entrega estará concluída quando o primeiro PR tiver o check `build-e-testes` verde, a aprovação de outro integrante e for integrado sem bypass.
