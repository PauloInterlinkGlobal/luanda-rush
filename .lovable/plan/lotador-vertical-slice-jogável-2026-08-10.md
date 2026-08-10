# LOTADOR — Vertical Slice Jogável

Jogo arcade top-down em Phaser 3 + TypeScript, montado dentro da app existente (TanStack Start). A rota `/` passa a ser o jogo em ecrã cheio.

## Pendente antes de começar

O atlas (JSON com coordenadas) ainda não chegou. Assim que o anexares, uso os frames reais para jogador, NPCs, passageiros, táxis, props e UI.

Enquanto isso não existir, o jogo arranca com um **atlas de fallback gerado em runtime** (sprites desenhados em Canvas no mesmo estilo/paleta) para nunca haver textura em falta. A troca para os frames reais é só uma mudança no `AssetConfig` — nenhum código de gameplay muda.

## O que vai existir na primeira entrega

Fluxo completo: abrir → menu → jogar 3 min → correr → encontrar passageiro → competir com NPC → levar ao táxi → lotar → ganhar Kz/XP → combo → resultado → guardar progresso → jogar de novo.

**Ecrãs**: Boot, Preload, Menu Principal, Jogo, Resultado.

**Mapa**: uma paragem urbana fictícia de Luanda — estrada, passeio, paragem, bancas, árvores, postes, contentores, muros, placas. Área compacta, densa, com colisões.

**Jogador**: masculino/feminino, andar/correr, stamina (gasta a correr, recupera parado, animação "cansado" a zero), interagir, chamar, comemorar.

**NPCs lotadores**: Kito (rápido), Manuel (estratégico), Débora (persuasiva). IA com o mesmo conjunto de regras do jogador: scan → avaliar → escolher alvo → mover → interagir → entregar. Podem roubar passageiros ("PASSAGEIRO PERDIDO!"), mas não trapaceiam.

**Passageiros**: tipos normal, apressado, indeciso, observador, exigente, correria, especial — cada um com destino, valor, paciência, urgência e máquina de estados.

**Táxis**: normal, rápido, grande, especial, dourado (evento). Destino, capacidade, contador de lotação, estados chegar → esperar → carregar → cheio → partir.

**Destinos**: Viana, Talatona, Centro (extensível).

**Economia e progressão**: Kz por passageiro/lotação, XP, níveis (Novato → Lenda), combo x1–x5 com perda por inatividade, power-ups Turbo e Megafone.

**Missões**: objetivos por partida com recompensas (3 táxis, 5 táxis, velocista, 10 passageiros).

**HUD e controlos**: Kz, combo, nível, tempo, táxi ativo com destino e lotação. Joystick virtual + botões contextuais (correr, chamar, interagir, power-up) no mobile; WASD/Shift/E/Space/Q/Esc no desktop. Aviso "Gire o dispositivo" em portrait.

**Áudio**: AudioManager com sons sintetizados (WebAudio) — passos, buzina, motor, recompensa, combo, UI — e camadas de música normal/hora de ponta. Sem ficheiros protegidos.

**Save**: localStorage versionado com nível, XP, Kz, upgrades, missões, recorde, definições.

**Extras pedidos**: tela de Mapa de Campanha (só a primeira zona desbloqueada), tela de Personagem/Customização, Missões, Definições (música, efeitos, vibração, qualidade, idioma PT/EN), e a ferramenta interna SpriteSheet Generator.

**Evento Hora de Ponta**: aleatório, mais passageiros/táxis/NPCs, recompensas maiores, música e efeitos acelerados.

**Debug/Test mode**: F1–F7 (spawn passageiro/táxi/NPC, +Kz, +XP, evento, stamina) apenas em desktop.

## Detalhes técnicos

- Instalar `phaser`; o jogo vive em `src/game/` e monta num `<div>` via `ClientOnly` na rota `/` (Phaser é browser-only, não pode correr em SSR).
- Estrutura: `game/scenes`, `game/entities`, `game/systems`, `game/ai`, `game/ui`, `game/data`, `game/config`, `game/types`.
- Configuração centralizada em `GameConfig.ts`, `BalanceConfig.ts`, `AssetConfig.ts`, `MapConfig.ts` — nenhum valor mágico espalhado.
- `AssetManager` único: carrega/valida atlas, regista animações a partir de `asset-manifest.json`, evita duplicados e cai no gerador procedural se um frame faltar.
- Object pooling para passageiros, textos flutuantes e partículas; escala adaptativa (`Scale.FIT`) para 360x640 até desktop; alvo 60 FPS.
- Arquitetura preparada (mas não implementada) para PWA, Capacitor, multiplayer e ranking online.
- Título/meta SEO próprios da rota e README com instalação, controlos e como adicionar personagens, spritesheets, táxis e mapas.

## Ordem de execução

1. Fundação: Phaser + cenas + AssetManager + fallback procedural.
2. Mapa, colisões e câmara.
3. Jogador, animações, stamina, controlos desktop e mobile.
4. Táxis e passageiros com máquinas de estado.
5. Interação, lotação, recompensas e feedback visual.
6. IA dos lotadores e competição.
7. Economia, XP, níveis, combo, power-ups, dificuldade dinâmica.
8. HUD, menu, resultado, missões, mapa, personagem, definições.
9. Áudio, save, Hora de Ponta, debug mode.
10. SpriteSheet Generator, otimização e polimento.
11. Substituição dos placeholders pelos frames do atlas real, quando chegar.
