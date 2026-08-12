# LOTADOR — Vertical Slice com o atlas real

O atlas chegou. Depois de o analisar, o plano muda num ponto importante: passamos a desenhar tudo com os sprites reais em vez das formas geradas em Canvas.

## O que os ficheiros anexados contêm

- `atlas.json` / `atlas.xml` — 299 frames calibrados contra a imagem que já temos (1536x1024), com grupos: jogador (masculino/feminino, idle/walk/action), NPCs (Kito, Manuel, Débora), Mestre Zé, 7 tipos de passageiros (idle + run), 5 táxis, props do mapa, tiles, efeitos, ícones de UI, placas de destino e logos. Traz também 38 animações já definidas (nomes de frames + fps + loop).
- `lotador_atlas.json` / `.xml` — mapa alternativo para uma imagem limpa `lotador_atlas.png` (2048x1536) que **não foi anexada**. Fica de lado até esse PNG existir; a troca depois é uma linha no `AssetConfig`.

Por isso usamos o par `atlas.json` + a imagem do concept.

## Ponto a resolver: fundo dos frames

A imagem de origem é a folha ilustrada com painéis azuis e etiquetas. Recortar um frame tal e qual traz o fundo azul do painel atrás da personagem. Solução: um passo de preparação que, para cada frame do atlas, recorta a região, remove o fundo do painel por semelhança de cor a partir das bordas (flood-fill tolerante) e recompõe tudo numa textura nova, limpa e transparente, publicada como asset do projeto. O jogo carrega essa textura + um JSON de frames normalizado.

Onde o recorte sair imperfeito (contornos com halo azul, frames que apanham texto da etiqueta), corrijo caso a caso ajustando a margem/tolerância desse frame. Se algum frame ficar impossível de limpar, esse elemento usa o desenho procedural já existente como reserva — o `AssetManager` já tem esse caminho.

## Como os frames entram no jogo

- **Jogador**: idle / walk / action (8 frames cada) por género. Como o atlas não tem linhas separadas por direção, esquerda/direita usam espelhamento horizontal e cima/baixo reutilizam o mesmo ciclo — mantendo o `Character` com a mesma API de direções.
- **Passageiros**: idle e run por tipo (normal, apressado, indeciso, observador, exigente, correria, especial), mais o retrato grande para painéis.
- **NPCs lotadores**: idle de Kito, Manuel e Débora + as linhas extra de lotadores para variedade de multidão.
- **Táxis**: frame "hero" e variantes por tipo (normal, rápido, grande, especial, dourado), com a animação de display do atlas.
- **Mapa**: tiles de estrada, passadeira, passeio, terra, relva e mercado + props (paragem, bancas, guarda-sóis, árvores, contentores, muros, poste, semáforo) — substituem os retângulos procedurais.
- **UI/efeitos**: moeda, XP, stamina, relógio, cadeado, megafone, troféus, botões, chama de combo, "táxi lotado", "passageiro perdido", turbo, megafone e as placas Viana/Talatona/Centro.

## O resto da entrega (inalterado)

Continua tudo o que já estava planeado: cenas Boot/Preload/Menu/Jogo/Resultado, mapa com colisões e câmara, stamina, joystick e botões no mobile + teclado no desktop, máquinas de estado de passageiros e táxis, IA dos lotadores com roubo de passageiros, economia em Kz, XP e níveis, combo x1–x5, Turbo e Megafone, missões, Hora de Ponta, save em localStorage, HUD, ecrãs de missões/personagem/definições, áudio sintetizado e modo debug F1–F7. A rota `/` passa a ser o jogo em ecrã cheio, com título e meta próprios.

Os sistemas e entidades já escritos (`Player`, `Passenger`, `Taxi`, `LotadorNPC`, `LotadorAI`, combo, economia, missões, dificuldade, power-ups, spawn) mantêm-se — só mudam as chaves de textura/animação que consomem.

## Detalhes técnicos

- Script de preparação do atlas corre no sandbox (recorte + remoção de fundo + empacotamento) e produz `lotador_atlas.png` + `lotador_atlas.frames.json`; o PNG vai para o CDN de assets do projeto e o JSON para `src/game/data/`.
- `AssetConfig.useExternalAtlas` passa a `true` e aponta para esses dois ficheiros; o gerador procedural fica como reserva por frame em falta.
- `AssetManager` regista as animações a partir do bloco `animations` do atlas, sem duplicados, e valida cada chave antes de usar.
- Escala `Scale.FIT` de 360x640 a desktop, pooling de passageiros/textos/partículas, alvo 60 FPS, Phaser montado via `ClientOnly` (não corre em SSR).

## Ordem de execução

1. Preparar e limpar o atlas; publicar a textura e o JSON de frames.
2. Ligar o `AssetManager` ao atlas real e registar as animações.
3. Mapa com tiles/props reais, colisões e câmara.
4. Jogador, animações e controlos (desktop + mobile).
5. Táxis e passageiros com sprites e estados.
6. Interação, lotação, recompensas e efeitos visuais do atlas.
7. IA dos lotadores e competição.
8. Economia, XP, níveis, combo, power-ups, dificuldade.
9. HUD e ecrãs (menu, resultado, missões, personagem, definições) com os ícones do atlas.
10. Áudio, save, Hora de Ponta, debug mode e polimento.
