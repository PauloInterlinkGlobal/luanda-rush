# Mais vida na paragem: novos NPCs, cenário e obstáculos

Usar as duas imagens enviadas (os 6 personagens e os 6 objectos de rua) como arte real do jogo, e povoar melhor o mapa.

## O que muda no jogo

**Pessoas**
- Os 6 personagens da imagem entram no jogo: 3 continuam a ser os lotadores rivais (Kito, Manuel, Débora) com a nova aparência, e os outros 3 passam a ser figurantes que andam pela paragem (o senhor da mala, a senhora com os sacos, o rapaz da mochila).
- Os figurantes só circulam e dão ambiente — não roubam passageiros nem interferem no jogo.
- Os passageiros que esperam táxi também passam a usar estas figuras, com variação de cor de roupa para não parecerem todos iguais.

**Cenário e obstáculos**
- Entram os objectos da imagem: banco de jardim, placa "PARAGEM DE TÁXI", barraca de água fresca, cone, árvore e o abrigo de paragem com o cartaz de Luanda.
- O abrigo de paragem é novo e fica no passeio, como ponto de referência da fila; a barraca de água e a placa substituem as versões desenhadas à mão.
- Mais objectos espalhados: mais árvores, cones em obra na estrada, bancos e caixotes, para o mapa deixar de parecer vazio.
- Árvore, barraca, abrigo, banco, placa e cones bloqueiam a passagem (o jogador e os NPCs contornam-nos); os cones em fila criam um pequeno desvio na estrada, para dar mais desafio a correr entre táxis.

**Aspecto**
- Tudo desenhado com a mesma escala e sombra por baixo, e desenhado por ordem de profundidade (quem está mais abaixo aparece à frente), como já acontece hoje.

## Como será feito (técnico)

1. Recortar automaticamente as duas imagens enviadas por componentes ligados (alpha), normalizar, aparar halos e empacotar duas folhas: `props_street.png` (+ JSON de frames) e `npcs_people.png` (frame único por pessoa, vista frontal).
2. Publicar ambas via `lovable-assets` e criar `src/assets/props_street.png.asset.json` e `src/assets/npcs_people.png.asset.json` + os JSON de coordenadas em `src/game/data/`.
3. Novo módulo `src/game/systems/SceneryArt.ts`: `preloadScenerySheets`, `buildPropFromSheet(scene, key)` e `buildPersonFromSheet(scene, key, recolor?)` — este último gera um spritesheet 4 direções a partir do frame frontal (espelho para lado, leve bob para andar), no mesmo formato que `buildCharacterSheet` produz, para nada em gameplay mudar.
4. `AssetManager`: pré-carregar as novas folhas; nas props e nos personagens, dar prioridade às novas folhas antes do atlas antigo e do procedural. Novas chaves `prop_shelter`, `prop_stall_agua`, `prop_sign_taxi`.
5. `MapConfig`: acrescentar `prop_shelter` no passeio, mais árvores/bancos/cones/caixotes, e uma lista `ambientSpawns` para os figurantes.
6. `GameScene`: registar colisão para os novos tipos de prop no ObjectLayer e criar figurantes com um passeio simples (waypoints aleatórios, sem IA de lotador). `ProceduralArt` continua como último recurso.
7. Verificação com Playwright: entrar numa partida, confirmar novos objectos, colisões e figurantes a andar, sem erros de consola.
