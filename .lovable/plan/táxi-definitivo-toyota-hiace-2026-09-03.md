# Táxi definitivo: Toyota Hiace

Substituir todos os veículos do jogo (os 5 tipos de táxi) por renderizações 2D do modelo `hiace_van.glb` enviado.

## O que muda no jogo

- Todos os táxis passam a ser a mesma carrinha Hiace, vista de lado, virada para a direita (sentido em que chegam à paragem).
- Cada tipo de táxi mantém a sua identidade pela cor da pintura: Normal (azul), Rápido (vermelho), Grande (azul escuro), Especial (verde), Dourado (dourado). As etiquetas de destino, lotação e temporizador continuam exactamente iguais.
- Sombra por baixo do veículo e pequena oscilação de andamento mantidas, para o táxi continuar a "rolar" quando chega e quando parte.
- Os sprites antigos de táxi (atlas e desenho procedural) deixam de ser usados; ficam apenas como último recurso caso o carregamento das novas imagens falhe.

## Como será feito (técnico)

1. **Pré-renderização offline** (no sandbox, com Playwright + three.js): carregar o `.glb`, câmara ortográfica em vista lateral direita, luz suave + luz de topo, fundo transparente. Antes de cada render, tingir o material `carpaint` com a cor do tipo de táxi (as cores já definidas em `src/game/data/taxis.ts`).
2. Exportar uma folha PNG por tipo com 2 frames (frame 0 parado, frame 1 com ligeira oscilação vertical), recortada e alinhada às dimensões usadas hoje pelo motor (`TAXI_W` 132 × `TAXI_H` 72, ajustando a proporção da carrinha se necessário — provavelmente `TAXI_W` 148 × `TAXI_H` 84 para não achatar a Hiace).
3. Publicar as 5 folhas no CDN via `lovable-assets` e criar os ponteiros `src/assets/taxi_<TIPO>.png.asset.json`.
4. Novo módulo `src/game/systems/TaxiArt.ts` com `buildTaxiFromSheet(scene, key, url)` que regista a textura com os 2 frames; pré-carregamento das imagens em `AssetManager.preload`.
5. `AssetManager.buildAll` passa a usar a folha Hiace primeiro; só cai no atlas (`buildTaxiFromAtlas`) ou no procedural se a imagem não existir.
6. Ajustar em `src/game/entities/Taxi.ts` o corpo de colisão e o ponto de embarque (`boardPoint`) ao novo tamanho, e as posições das etiquetas/barra por cima do veículo.
7. Verificação com Playwright: iniciar uma partida, confirmar chegada, embarque e partida com a Hiace, sem erros de consola.

## Notas

- O modelo não tem texturas (só materiais de cor), por isso a recoloração por tipo é directa e limpa.
- O `.glb` não é carregado em runtime — o jogo continua 2D e leve; apenas usamos o modelo para gerar os sprites.
