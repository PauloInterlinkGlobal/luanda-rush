# Substituir a folha de sprites do jogador

A folha atual tem cortes errados (frames sem pernas, restos de fundo branco). A imagem
enviada agora já vem com fundo 100% transparente e recortes corretos, e passa a ser a
fonte única do personagem.

## O que foi verificado na imagem enviada

- 536x466 px, RGBA, fundo totalmente transparente (alfa 0 nas margens).
- Grelha regular de 6 colunas x 4 linhas (24 frames), detetada pelos vãos de alfa.
- Resolução por frame menor do que a folha atual (~89x116 vs 157x203), pelo que os
  frames serão redimensionados para cima no ecrã do jogo — aceitável, mas vale a pena
  saber que o detalhe é o da imagem enviada.

## Passos

1. **Reprocessar a grelha** — dividir a imagem em 24 células pelos limites reais de
   alfa (não por divisão cega), medir a caixa de cada personagem e voltar a empacotar
   numa folha regular: mesma dimensão de célula para todos, centrado na horizontal e
   pés alinhados à base, para que parado/correr não "salte".
2. **Sem tratamento de fundo** — a imagem já está limpa; não se aplica flood-fill nem
   erosão de alfa (evita comer contornos). Só se apara alfa residual < 8.
3. **Confirmar a ordem das linhas/colunas** — inspeção visual dos 24 frames recortados
   para mapear cada linha a uma direção (frente, trás, esquerda, direita) e cada coluna
   a parado_0, parado_1, correr_0..3. Se alguma linha lateral estiver virada para o
   lado errado, é espelhada no empacotamento.
4. **Publicar a folha nova** como asset CDN e substituir
   `src/assets/player_sheet.png.asset.json` (o asset antigo é removido do CDN).
5. **Atualizar `src/game/data/player-frames.json`** com as novas coordenadas e tamanho
   de célula. Os nomes dos frames (`front_idle_0`, `right_run_3`, ...) mantêm-se, por
   isso `AtlasArt.buildPlayerFromSheet` e o `AssetManager` não precisam de alterações
   de lógica.
6. **QA** — pré-visualização em xadrez para confirmar zero fundo, pés alinhados e
   escala constante, e verificação no jogo (menu → PERSONAGEM → partida) das 4
   direções paradas e a correr, sem erros de consola.

## Notas técnicas

- Processamento em Python (PIL + numpy) no sandbox; saída PNG RGBA.
- A recoloração por faixas (camisola/calças/sapatos) do ecrã PERSONAGEM continua a
  funcionar, já que atua sobre o frame desenhado.
- Nada muda para NPCs, táxis e props — continuam no atlas `lotador_sprites.png`.
