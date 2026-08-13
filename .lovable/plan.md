# Tela de Personagem + Sair do Jogo

## O que vais ter

### 1. Tela de Personagem (nova, completa)
Substitui o painel atual (que só troca masculino/feminino) por um ecrã de customização a sério:

- **Pré-visualização grande** do lotador ao centro, virado para a direcção escolhida.
- **Selector de animação**: PARADO, ANDAR, CORRER, CHAMAR, COMEMORAR, CANSADO — clicar toca a animação em loop no preview, para veres como o boneco se mexe.
- **Selector de direcção**: baixo / lado / cima (setas), para inspeccionar o sprite de todos os ângulos.
- **Aparência**, com setas ‹ › em cada linha:
  - Género (Lotador / Lotadora) — troca o sprite base do atlas
  - Cor da camisola
  - Cor das calças
  - Cor dos sapatos
  - Tom de pele e cabelo (só no estilo clássico, ver abaixo)
  - Acessório: boné, chapéu, mochila, nenhum
- **Estilo do sprite**: REAL (frames do spritesheet do jogo, com camisola/acessório recolorados por cima) ou CLÁSSICO (sprite gerado, onde todas as cores são livres). Assim ninguém perde a arte real, mas quem quiser cor total tem opção.
- **Nome do lotador** editável (usado no HUD e no ecrã de resultado).
- Botões **GUARDAR** e **PREDEFINIÇÃO** (repõe o visual base).
- Tudo persiste no save local e é aplicado imediatamente ao jogador dentro da partida.

### 2. Sair do jogo
- **No menu principal**: botão **SAIR** com confirmação. Fecha a sessão de jogo e mostra um ecrã de despedida ("Até à próxima, lotador!") com botão para voltar a entrar (num browser não é possível fechar o separador por código).
- **Durante a partida**: botão de pausa no HUD (canto superior) → painel com CONTINUAR, DEFINIÇÕES RÁPIDAS (música/efeitos), **SAIR DA PARTIDA** (volta ao menu, com confirmação para não perder o progresso da corrida em curso).
- **ESC** no teclado abre/fecha a pausa.

## Detalhes técnicos

- `src/game/types/index.ts`: `CharacterSkin` ganha `style: "atlas" | "classic"` e o save ganha `playerName`. `SaveManager` faz merge retrocompatível (saves antigos continuam a funcionar).
- `src/game/systems/AtlasArt.ts`: `buildCharacterFromAtlas` aceita opções de recolor — aplica tinta multiplicativa por faixa vertical (torso = camisola, pernas = calças, pés = sapatos) com `globalCompositeOperation` sobre o alpha do frame, e desenha o acessório no topo da cabeça. Sem opções, o comportamento actual mantém-se igual.
- `src/game/systems/AssetManager.ts`: `rebuildPlayer` passa a respeitar `style` (atlas com recolor vs `buildCharacterSheet` procedural) e re-regista as animações do jogador.
- Novo `src/game/scenes/CharacterScene.ts` (ecrã dedicado, em vez do painel apertado do menu); `MenuScene` passa a abrir esta cena e mantém MISSÕES/DEFINIÇÕES como estão.
- Novo `src/game/scenes/PauseScene.ts` lançada por cima da `GameScene` (`scene.pause`/`resume`), registada em `src/game/index.ts`.
- `HUDScene`: botão de pausa + tecla ESC; `GameScene` limpa spawns e volta ao `Menu` ao sair da partida.
- Sem alterações de backend; tudo local e visual.
