# Sprite sheet do jogador — limpeza, alinhamento e reempacotamento

## Fonte escolhida

As imagens enviadas repetem o mesmo personagem em várias resoluções. A melhor
combinação é:

- `preview_2.webp` (783x820) — 4 linhas x 6 colunas, sem rótulos, maior resolução por frame.
- `spritesheet_payer.webp` (600x460) — mesma grelha, mas **com rótulos**, usada só para
  confirmar a ordem: por linha `idle_0, idle_1, run_0, run_1, run_2, run_3`;
  linhas por ordem `front (frente), back (trás), left (esquerda), right (direita)`.

Resultado: 24 frames coerentes (4 direções x 2 parado + 4 correr).

## O que vai ser feito

1. **Recorte da grelha** — dividir `preview_2.webp` em 24 células.
2. **Fundo transparente** — remover o branco/cinza claro por flood-fill a partir das
   bordas (não por limiar global), preservando brancos legítimos do personagem
   (ténis, meias, logótipo do boné). Sombra de contacto no chão é removida como fundo.
3. **Limpeza de bordas** — erosão de 1px do alfa + desfranja (remoção do halo branco
   nos pixéis semitransparentes) para não sobrar contorno claro.
4. **Normalização de escala** — medir a altura real do personagem em cada frame e
   escalar todos para a mesma altura de referência (a maior altura "parado"), para
   que o tamanho não oscile na animação.
5. **Centragem e alinhamento ao chão** — cada frame centrado horizontalmente pelo
   centro de massa do corpo e alinhado com os pés na base da célula, com uma margem
   fixa de 2px. Assim `idle` e `run` não "saltam".
6. **Empacotamento** — folha única em grelha regular 6 colunas x 4 linhas, sem
   espaços extra, ordem preservada por direção e estado. Saída PNG RGBA.
7. **Atlas JSON** — ficheiro com o nome de cada frame (`front_idle_0`, `right_run_3`, ...)
   e a respetiva célula, no mesmo formato que `src/game/data/atlas-frames.json`.
8. **QA visual** — inspeção do PNG final (fundo em xadrez) para confirmar zero halo,
   escala constante e pés alinhados; correção e nova verificação se necessário.

## Integração no jogo

- A folha nova é publicada como asset CDN (`src/assets/player_sheet.png.asset.json`)
  e o atlas guardado em `src/game/data/player-frames.json`.
- `AtlasArt.ts` ganha um construtor que monta a spritesheet do jogador diretamente
  a partir destes frames reais (4 direções x 6 slots), mantendo o layout que
  `AssetManager.registerCharacterAnims` já espera: slot 0 = idle, slots 1–4 = ciclo
  de corrida, slot 5 = interagir (reutiliza `idle_1`).
- `AssetManager.buildPlayer` passa a preferir esta folha para o estilo "REAL";
  o fallback procedural e o estilo "CLÁSSICO" ficam intactos.
- O ecrã PERSONAGEM continua a funcionar; a recoloração por faixas aplica-se
  também a estes frames.

## Entregáveis

- PNG final com fundo transparente (também guardado em `/mnt/documents/` para download).
- Atlas JSON dos frames.
- Jogador no jogo a usar os sprites limpos nas 4 direções, parado e a correr.

## Notas técnicas

- Processamento em Python com PIL + numpy no sandbox (flood-fill de fundo,
  desfranja alfa, medição de bounding box por alfa).
- Só o personagem do jogador é afetado; NPCs, táxis e props continuam no
  atlas atual `lotador_sprites.png`.
