# Pôr as pessoas reais dentro do jogo

A imagem enviada tem 6 pessoas. O jogo já tem a estrutura para as usar, mas é preciso refazer o recorte com esta versão nova e garantir que elas aparecem mesmo em partida.

## O que muda no jogo

- As 6 figuras da imagem passam a ser a arte usada por: os lotadores rivais, o mentor, os passageiros à espera e os transeuntes que passeiam pela paragem.
- Os passageiros deixam de repetir a mesma figura: cada tipo de passageiro fica ligado a uma pessoa diferente e a cor da roupa varia um pouco, para a paragem parecer cheia de gente diferente.
- Mais gente na cena: sobe o número de transeuntes (de 6 para cerca de 10) e ficam a circular por mais pontos do mapa, incluindo o passeio e a zona de trás.
- As pessoas continuam a ser desenhadas por profundidade (quem está mais à frente tapa quem está atrás) e com sombra por baixo, à mesma escala do jogador.

## Como será feito (técnico)

1. Recortar `npcs-removebg-preview-2.png` por componentes ligados (alpha), aparar halos, normalizar altura e reempacotar `npcs_people.png`; publicar via `lovable-assets` e actualizar `src/assets/npcs_people.png.asset.json` + `src/game/data/npcs-frames.json`.
2. `AssetManager`: rever `NPC_PEOPLE`, `PASSENGER_PEOPLE` (um mapeamento distinto para cada um dos 7 tipos, com variação de camisa) e `AMBIENT_PEOPLE` (usar as 6 figuras).
3. `MapConfig`: alargar `ambientSpawns` para ~10 pontos espalhados.
4. `GameScene.spawnPedestrians`: criar um figurante por ponto, com figura e cor sorteadas.
5. Verificar em partida com Playwright: capturas do mapa com passageiros e transeuntes visíveis, consola sem erros.
