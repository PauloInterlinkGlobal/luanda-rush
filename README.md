# Luanda Rush

Anexei

os ficheiros: "spritesheet" (imagens com todos os sprites do jogo) e

"atlas" (coordenadas de cada sprite dentro da imagem). Usa estes

ficheiros reais para desenhar os personagens e objetos do jogo — NÃO

desenhes formas geométricas genéricas nem emojis do sistema para estas

entidades.

🎮 PROMPT MESTRE — LOTADOR

Jogo mobile/web completo inspirado no cotidiano dos lotadores de Luanda

Você é uma equipe completa de desenvolvimento de jogos formada por:

Game Designer

Gameplay Programmer

TypeScript Developer

Phaser 3 Developer

2D/2.5D Artist

Character Designer

Sprite Sheet Artist

Animator

UI/UX Designer

Sound Designer

Game Economy Designer

AI/NPC Programmer

Mobile Game Optimizer

Technical Architect

Sua missão é desenvolver um jogo completo, jogável, divertido e visualmente agradável chamado LOTADOR.

Não quero apenas uma demonstração visual.

Quero um jogo funcional, com gameplay real, personagens, NPCs, passageiros, táxis, mapa, objetos, spritesheets, animações, sons, UI, economia, progressão, missões e sistema de save.

1. NOME DO JOGO

LOTADOR

Slogan:

CORRE. CHAMA. LOTA. GANHA.

2. CONCEITO

LOTADOR é um jogo arcade/casual inspirado de forma fictícia e respeitosa na rotina dos jovens que trabalham como lotadores de táxi em Luanda, Angola.

O jogador controla um lotador que trabalha numa paragem.

Sua missão é:

encontrar passageiros;

identificar o destino;

encontrar um táxi compatível;

chamar o passageiro;

convencer o passageiro;

levar o passageiro até ao táxi;

ajudar a lotar o táxi;

receber recompensa virtual;

competir contra outros lotadores;

melhorar suas habilidades;

desbloquear novas áreas.

Quanto mais rápido o jogador lotar os táxis, maior será sua pontuação.

3. EXPERIÊNCIA QUE O JOGADOR DEVE SENTIR

O jogo deve transmitir:

velocidade

competição

caos controlado

estratégia

humor

progressão

recompensa

O jogador deve pensar:

"Só mais uma partida."

4. TECNOLOGIA

Utilize:

Phaser 3

TypeScript

Vite

HTML5

CSS3

JavaScript/TypeScript

Estruture o projeto para funcionar em:

desktop;

Android;

dispositivos touchscreen;

navegador mobile.

Utilize arquitetura preparada para futura transformação em:

PWA;

Android APK;

Capacitor;

multiplayer online.

NÃO implemente multiplayer neste primeiro MVP.

5. TIPO DE JOGO

Criar um jogo:

2D/2.5D top-down arcade

com estética:

cartoon + urban African + low-poly-inspired 2D

O jogo deve parecer moderno e profissional.

Evitar aparência de jogo infantil excessivamente simples.

Criar uma identidade visual própria.

6. DIREÇÃO ARTÍSTICA

A inspiração visual deve ser:

Luanda;

transporte urbano;

bairros;

mercados;

ruas movimentadas;

paragens;

comércio informal;

táxis;

jovens;

ambiente urbano africano.

Mas NÃO copiar pessoas reais.

Não utilizar marcas comerciais reais.

Não utilizar logotipos de empresas reais.

Não utilizar imagens protegidas por copyright.

Criar uma identidade fictícia própria.

7. VISÃO DO MAPA

O primeiro mapa deve representar uma:

PARAGEM URBANA FICTÍCIA DE LUANDA

Criar:

estrada;

paragem;

calçada;

pequenas lojas;

bancas;

árvores;

postes;

contentores;

bancos;

muros;

placas;

casas;

pequenos edifícios;

vendedores;

passageiros;

táxis;

veículos decorativos;

elementos de rua;

lixo;

cones;

sinalização.

O mapa precisa parecer vivo.

8. CÂMERA

Utilizar câmera:

top-down/isométrica

com leve perspectiva.

O jogador deve conseguir visualizar:

personagem;

passageiros;

táxis;

NPCs;

obstáculos;

áreas importantes.

A câmera deve acompanhar o jogador suavemente.

9. CONTROLES

MOBILE

Criar joystick virtual no lado esquerdo.

No lado direito:

🏃 CORRER

📢 CHAMAR

🤝 INTERAGIR

⚡ POWER-UP

Os botões devem ser contextuais.

DESKTOP

Adicionar:

WASD = movimentar
SHIFT = correr
E = interagir
SPACE = chamar
Q = power-up
ESC = pausa


10. PERSONAGEM PRINCIPAL

Criar personagem principal chamado:

JOGADOR

Permitir seleção:

Masculino

Feminino

Criar sistema de personalização.

11. SPRITESHEET DO JOGADOR

Criar spritesheets separados para:

idle

walk_down

walk_up

walk_left

walk_right

run_down

run_up

run_left

run_right

interact

celebrate

tired

Cada animação deve possuir vários frames.

Preferência:

4 a 8 frames por animação

dependendo da complexidade.

12. PADRÃO DOS SPRITESHEETS

Todos os spritesheets devem seguir:

tamanho uniforme;

mesma escala;

mesmo ponto de origem;

fundo transparente;

grid regular;

nenhum frame cortado;

margem consistente;

personagem centralizado;

orientação consistente.

Utilizar preferencialmente:

64x64

ou

96x96

por frame.

Escolher automaticamente o tamanho que produzir melhor qualidade.

13. SPRITESHEET DE ANIMAÇÃO

Criar um sistema que permita carregar:

player_idle
player_walk
player_run
player_interact
player_celebrate
player_tired


Exemplo:

assets/
  sprites/
    player/
      player_idle.png
      player_walk.png
      player_run.png
      player_interact.png
      player_celebrate.png
      player_tired.png


Se o ambiente não permitir gerar PNG diretamente, criar uma alternativa funcional utilizando:

SVG;

Canvas;

sprites procedurais;

ou placeholders gerados automaticamente.

NUNCA deixar o jogo quebrado simplesmente porque um asset gráfico não foi gerado.

14. NPC — LOTADORES

Criar pelo menos:

KITO "RELÂMPAGO"

Especialidade:

velocidade.

MANUEL "VETERANO"

Especialidade:

estratégia.

DÉBORA

Especialidade:

persuasão.

15. SPRITESHEETS DOS NPCS

Cada NPC deve possuir:

idle
walk
run
interact
celebrate
tired


Criar aparência visual diferente para cada um.

Exemplo:

Kito:

roupa esportiva;

mochila;

aparência jovem.

Manuel:

aparência mais experiente;

roupa simples.

Débora:

visual urbano moderno;

acessórios próprios.

16. MESTRE ZÉ

Criar personagem:

MESTRE ZÉ

Função:

mentor.

Ele explica:

como jogar;

como abordar passageiros;

como lotar táxis;

como ganhar Kz;

como usar upgrades.

Criar sprites:

idle
talk
point
walk
celebrate


17. PASSAGEIROS

Criar diferentes personagens.

No mínimo:

Passageiro masculino normal

Passageira normal

Passageiro apressado

Passageira apressada

Passageiro idoso

Passageira idosa

Jovem

Trabalhador

Passageiro especial

Cada um deve possuir aparência distinta.

18. SPRITESHEETS DOS PASSAGEIROS

Criar animações:

idle
walk
run
waiting
talk
boarding
leaving


Utilizar reutilização de assets quando possível.

Criar sistema de variações:

cabelo;

roupa;

cor;

acessórios;

gênero;

idade.

Isso permitirá gerar muitos NPCs sem criar centenas de sprites diferentes.

19. TÁXIS

Criar veículos fictícios inspirados em táxis urbanos.

Não utilizar marcas reais.

Criar pelo menos:

TÁXI NORMAL

Capacidade:

4 passageiros.

TÁXI RÁPIDO

Capacidade:

TÁXI GRANDE

Capacidade:

TÁXI ESPECIAL

Capacidade:

TÁXI DOURADO

Evento especial.

20. SPRITES DOS TÁXIS

Criar sprites para:

taxi_normal
taxi_fast
taxi_large
taxi_special
taxi_golden


Cada veículo deve possuir:

frente;

traseira;

lateral;

movimento;

parado.

Se o jogo utilizar visão top-down, criar sprites orientados para as direções necessárias.

21. ANIMAÇÕES DOS TÁXIS

Criar:

idle
arriving
waiting
loading
full
departing


Adicionar efeitos:

fumaça;

poeira;

movimento das rodas;

luzes;

pequena vibração.

22. PASSAGEIROS E TÁXIS

O passageiro deve saber:

destino


O táxi deve possuir:

destino
capacidade
passageiros atuais


Um passageiro somente pode entrar num táxi compatível.

23. DESTINOS

Criar inicialmente:

VIANA

TALATONA

CENTRO

Preparar sistema para adicionar posteriormente:

Samba;

Rangel;

Camama;

Kilamba Kiaxi;

outras áreas.

24. MECÂNICA CENTRAL

Implementar exatamente este loop:

TÁXI CHEGA
        ↓
MOSTRA DESTINO
        ↓
PASSAGEIROS APARECEM
        ↓
LOTADORES IDENTIFICAM ALVOS
        ↓
JOGADOR CORRE
        ↓
ABORDA PASSAGEIRO
        ↓
PASSAGEIRO ACEITA
        ↓
JOGADOR LEVA AO TÁXI
        ↓
PASSAGEIRO ENTRA
        ↓
TÁXI PROGRIDE
        ↓
TÁXI LOTADO
        ↓
RECOMPENSA
        ↓
XP
        ↓
COMBO
        ↓
NOVO TÁXI


25. SISTEMA DE PASSAGEIROS

Cada passageiro possui:

interface Passenger {
    id: string;
    type: PassengerType;
    destination: Destination;
    value: number;
    urgency: number;
    patience: number;
    speed: number;
    state: PassengerState;
}


Estados:

SPAWNING
WAITING
SEARCHING
APPROACHED
ACCEPTED
FOLLOWING
BOARDING
COMPLETED
LEAVING


26. SISTEMA DE TÁXI

Cada táxi:

interface Taxi {
    id: string;
    type: TaxiType;
    destination: Destination;
    capacity: number;
    currentPassengers: number;
    reward: number;
    state: TaxiState;
}


Estados:

ARRIVING
WAITING
LOADING
FULL
DEPARTING
GONE


27. IA DOS LOTADORES

A IA deve ser funcional.

Cada NPC:

procura passageiros;

calcula distância;

analisa valor;

analisa urgência;

escolhe alvo;

corre;

tenta pegar passageiro;

leva passageiro ao táxi;

procura próximo alvo.

Algoritmo:

SCAN
 ↓
EVALUATE
 ↓
SELECT TARGET
 ↓
MOVE
 ↓
INTERACT
 ↓
DELIVER
 ↓
REPEAT


28. COMPETIÇÃO

O jogador deve conseguir perder passageiros.

Exemplo:

O jogador corre em direção a um passageiro.

Um NPC chega primeiro.

Mostrar:

PASSAGEIRO PERDIDO!

Isso deve criar emoção.

Porém:

NUNCA trapacear.

A IA deve obedecer às mesmas regras do jogador.

29. ESCASSEZ

Criar dificuldade dinâmica.

Variáveis:

passengerSpawnRate
taxiSpawnRate
npcCount
eventIntensity


Fácil:

10 passageiros
3 lotadores


Médio:

8 passageiros
6 lotadores


Difícil:

5 passageiros
10 lotadores


30. STAMINA

Criar:

stamina = 100


Correr consome.

Parar recupera.

Quando chegar a zero:

jogador não pode correr;

velocidade diminui;

animação tired.

31. ECONOMIA

Usar:

Kz virtual

Não representar dinheiro real.

Valores:

Normal = 100 Kz
Apressado = 150 Kz
Indeciso = 150 Kz
Observador = 200 Kz
Exigente = 250 Kz
Correria = 300 Kz
Especial = 500 Kz


Bônus:

Táxi normal = +100
Táxi rápido = +150
Táxi grande = +200
Táxi especial = +300


32. XP

Passageiro = +5 XP

Táxi lotado = +25 XP

Lotação rápida = +10 XP

Combo = +10 até +50 XP

Missões = +50 até +500 XP


33. NÍVEIS

Criar:

1  Novato
5  Lotador
10 Experiente
15 Profissional
20 Veterano
30 Mestre
40 Elite
50 Lenda


Criar progressão configurável.

34. UPGRADES

Criar:

VELOCIDADE

RESISTÊNCIA

VOZ

PERSUASÃO

Cada atributo possui:

10 níveis.

35. POWER-UPS

Criar:

⚡ TURBO

+40% velocidade.

8 segundos.

📢 MEGAFONE

Maior alcance de chamada.

10 segundos.

Preparar:

RADAR

ÍMAN

COMBO SHIELD

36. COMBO

Criar:

x1
x2
x3
x4
x5


Mostrar:

🔥 COMBO x5


Se passar muito tempo sem conseguir lotação:

COMBO PERDIDO

37. MISSÕES

Criar sistema de missões.

Exemplos:

PRIMEIRO TURNO

3 táxis.

500 Kz.

NÃO PARA!

5 táxis.

800 Kz.

VELOCISTA

Táxi em menos de 30 segundos.

1.000 Kz.

REI DA VOZ

10 passageiros.

700 Kz.

38. PARTIDA

Cada partida:

3 minutos

Fluxo:

3
2
1
GO!


Durante a partida:

táxis;

passageiros;

NPCs;

eventos.

Final:

FIM!

39. EVENTO HORA DE PONTA

Adicionar evento aleatório:

🔥 HORA DE PONTA

Efeitos:

mais passageiros;

mais táxis;

mais NPCs;

maior recompensa;

música acelerada;

efeitos visuais.

40. SPRITESHEET DOS OBJETOS

Criar spritesheets para:

street_objects
street_signs
benches
trash
trees
bushes
shops
market_stalls
walls
barriers
lamps
traffic_objects


Cada objeto deve ter:

sprite principal;

variações;

estados quando necessário.

41. SPRITESHEET DE EFEITOS

Criar spritesheets para:

dust
smoke
spark
money
xp
combo
speed
celebration
hit
interaction


Exemplo:

Quando táxi lotar:

🔥
TÁXI LOTADO!
+500 Kz
+25 XP


Adicionar animação de recompensa.

42. SPRITESHEET DE UI

Criar assets para:

buttons
icons
coins
xp
stamina
combo
powerups
map
missions
settings
character
taxi
passenger


43. SISTEMA DE ASSET MANAGER

Criar:

AssetManager


Responsável por:

carregar assets;

verificar assets;

evitar carregamento duplicado;

fornecer sprites;

fornecer animações.

44. ESTRUTURA DE PASTAS

Criar:

lotador/
│
├── src/
│   ├── main.ts
│   │
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── GameScene.ts
│   │   ├── ResultScene.ts
│   │   ├── MapScene.ts
│   │   ├── CharacterScene.ts
│   │   ├── MissionsScene.ts
│   │   └── SettingsScene.ts
│   │
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Passenger.ts
│   │   ├── Taxi.ts
│   │   ├── LotadorNPC.ts
│   │   └── Mentor.ts
│   │
│   ├── systems/
│   │   ├── GameManager.ts
│   │   ├── PassengerManager.ts
│   │   ├── TaxiManager.ts
│   │   ├── SpawnManager.ts
│   │   ├── DifficultyManager.ts
│   │   ├── EconomyManager.ts
│   │   ├── ProgressionManager.ts
│   │   ├── MissionManager.ts
│   │   ├── ComboManager.ts
│   │   ├── PowerUpManager.ts
│   │   ├── SaveManager.ts
│   │   └── AudioManager.ts
│   │
│   ├── ai/
│   │   └── LotadorAI.ts
│   │
│   ├── ui/
│   │   ├── HUD.ts
│   │   ├── VirtualJoystick.ts
│   │   ├── ActionButtons.ts
│   │   ├── FloatingText.ts
│   │   └── DialogSystem.ts
│   │
│   ├── data/
│   │   ├── passengers.ts
│   │   ├── taxis.ts
│   │   ├── missions.ts
│   │   ├── upgrades.ts
│   │   └── maps.ts
│   │
│   └── types/
│
├── public/
│   └── assets/
│       ├── sprites/
│       ├── tiles/
│       ├── objects/
│       ├── effects/
│       ├── ui/
│       └── audio/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md


45. SISTEMA DE SPRITESHEET

Criar um sistema centralizado de animações.

Exemplo:

player.anims.play('player-run-right');


Animações:

player-idle
player-walk
player-run
player-interact
player-celebrate
player-tired

npc-kito-run
npc-manuel-run
npc-debora-run

passenger-walk
passenger-run
passenger-talk
passenger-board

taxi-arrive
taxi-loading
taxi-depart


46. REGRAS PARA SPRITESHEETS

Cada spritesheet deve:

ter fundo transparente;

usar grid uniforme;

manter escala consistente;

não cortar personagens;

manter pivô consistente;

possuir nomes claros;

possuir metadata quando necessário.

Se possível, gerar também:

spritesheet.json


contendo:

frame width;

frame height;

frame count;

animation names;

FPS.

47. SISTEMA DE ANIMAÇÃO

As animações devem responder ao estado.

Exemplo:

velocity = 0
→ idle

velocity > 0
→ walk

isRunning = true
→ run

stamina <= 0
→ tired

interaction
→ interact

taxi completed
→ celebrate


48. UI PRINCIPAL

Criar:

LOTADOR

💰 12.450 Kz
⭐ Nível 12

[ ▶ JOGAR ]

[ 🗺️ MAPA ]

[ 👕 PERSONAGEM ]

[ 🎯 MISSÕES ]

[ 🏆 RANKING ]

[ ⚙️ DEFINIÇÕES ]


49. HUD

Durante gameplay:

💰 4.850 Kz

🔥 x3

⭐ LVL 12

⏱️ 01:42

🚐 VIANA
3 / 4


Joystick:

lado esquerdo.

Botões:

lado direito.

50. FEEDBACK

Quando pegar passageiro:

+100 Kz
+5 XP


Quando lotar:

🔥 TÁXI LOTADO!
+500 Kz
+25 XP


Quando perder:

PASSAGEIRO PERDIDO!


Utilizar:

floating text;

partículas;

escala;

pequenas vibrações;

sons.

51. ÁUDIO

Criar sistema:

AudioManager


Sons:

passos;

corrida;

buzina;

motor;

táxi chegando;

táxi partindo;

passageiro;

recompensa;

combo;

power-up;

interface.

Criar música:

Normal

Competição

Hora de Ponta

52. AMBIENTE SONORO

Criar sons ambiente:

trânsito;

pessoas;

vendedores;

motores;

buzinas;

rua.

Não usar gravações protegidas.

Usar sons livres, sintetizados ou placeholders.

53. SISTEMA DE SAVE

Salvar localmente usando:

localStorage


Salvar:

level
xp
money
upgrades
skins
missions
bestScore
unlockedMaps
settings


Criar versionamento do save.

54. RESPONSIVIDADE

O jogo deve funcionar em:

360x640;

375x667;

390x844;

412x915;

tablets;

desktop.

Utilizar escala adaptativa.

55. ORIENTAÇÃO

O jogo deve funcionar preferencialmente:

LANDSCAPE

em dispositivos móveis.

Adicionar mensagem:

Gire o dispositivo


quando necessário.

56. PERFORMANCE

O jogo deve ser otimizado para:

smartphones de entrada;

smartphones médios;

desktop.

Utilizar:

object pooling;

sprite atlases;

poucas partículas;

poucas entidades simultâneas;

gerenciamento de memória;

carregamento otimizado;

evitar loops desnecessários.

Objetivo:

60 FPS quando possível.

57. GAMEPLAY LOOP

O jogador deve experimentar:

CORRER
↓
ENCONTRAR
↓
CHAMAR
↓
CONVENCER
↓
LEVAR
↓
LOTAR
↓
GANHAR
↓
UPGRADE
↓
REPETIR


58. PRIMEIRO MAPA

O primeiro mapa deve ter aproximadamente:

uma área de jogo pequena, mas suficientemente grande para permitir perseguições e competição.

Não criar uma cidade enorme.

Priorizar:

densidade + jogabilidade.

59. OBJETIVO DO MVP

O MVP deve permitir:

abrir o jogo;

ver menu;

iniciar partida;

controlar jogador;

correr;

encontrar passageiros;

abordar passageiros;

competir contra NPCs;

identificar táxis;

levar passageiros;

lotar táxi;

ganhar Kz;

ganhar XP;

criar combo;

usar power-up;

terminar partida;

ver resultados;

salvar progresso;

jogar novamente.

60. NÃO IMPLEMENTAR AINDA

Não implementar neste primeiro MVP:

multiplayer;

login;

backend;

pagamentos;

anúncios;

ranking online;

chat;

loja com dinheiro real;

microtransações;

mundo aberto gigante.

Criar somente a arquitetura preparada para essas funcionalidades futuras.

61. ASSETS

Se você tiver capacidade de gerar imagens/assets:

Crie os assets.

Se não tiver:

gere automaticamente assets procedurais/placeholder.

Nunca deixe:

missing texture


ou

file not found


na versão funcional.

62. GERADOR DE SPRITESHEETS

Criar também uma pequena ferramenta interna chamada:

SpriteSheet Generator

Ela deve permitir:

selecionar sprites;

organizar frames;

definir número de colunas;

definir número de linhas;

definir FPS;

exportar spritesheet;

gerar JSON de animação.

Criar interface simples:

SPRITESHEET GENERATOR

[ Selecionar imagens ]

Frame Width:
[ 64 ]

Frame Height:
[ 64 ]

Columns:
[ 8 ]

Rows:
[ 1 ]

FPS:
[ 10 ]

Animation:
[ player_run ]

[ GENERATE SPRITESHEET ]


Se o ambiente não permitir gerar arquivos PNG diretamente, criar exportação SVG/Canvas como alternativa.

63. ASSET MANIFEST

Criar arquivo:

asset-manifest.json


com:

{
  "player": {},
  "npcs": {},
  "passengers": {},
  "taxis": {},
  "objects": {},
  "effects": {},
  "ui": {}
}


64. CONFIGURAÇÃO CENTRAL

Criar arquivos de configuração.

Exemplo:

GameConfig.ts
BalanceConfig.ts
AssetConfig.ts
MapConfig.ts


Não espalhar valores pelo código.

65. GAME BALANCE

Todos os valores devem ser facilmente modificáveis.

Exemplo:

export const BALANCE = {
    matchDuration: 180,
    startingMoney: 0,
    passengerReward: 100,
    taxiBonus: 100,
    maxStamina: 100
};


66. DEBUG MODE

Criar modo debug.

Permitir:

F1 = spawn passenger
F2 = spawn taxi
F3 = spawn NPC
F4 = add money
F5 = add XP
F6 = activate event
F7 = refill stamina


Somente desktop/debug.

67. TEST MODE

Criar uma opção:

TEST MODE

para verificar:

colisões;

spawn;

IA;

recompensa;

animações;

spritesheets;

desempenho.

68. DESIGN DE IA

Não fazer IA extremamente complexa.

Priorizar:

previsibilidade + diversão.

Os NPCs devem parecer inteligentes, mas não impossíveis de vencer.

Adicionar pequenas diferenças:

Kito:
speed = 1.25

Manuel:
speed = 1.0
strategy = 1.3

Debora:
persuasion = 1.25


69. SISTEMA DE COLISÃO

Criar colisões para:

jogador;

NPC;

passageiros;

táxis;

obstáculos.

Evitar que personagens fiquem presos.

Criar sistema de separação simples entre NPCs.

70. SISTEMA DE SPAWN

Criar:

SpawnManager


Responsável por:

passageiros;

táxis;

NPCs;

power-ups;

eventos.

Utilizar áreas de spawn configuráveis.

71. SISTEMA DE DIFICULDADE

Criar:

DifficultyManager


A dificuldade aumenta com:

tempo;

nível;

número de táxis;

quantidade de NPCs;

menor disponibilidade de passageiros.

72. TELA DE RESULTADO

Mostrar:

🏁 FIM!

🚐 Táxis lotados: 8

👥 Passageiros: 27

🔥 Combo máximo: x5

💰 +4.850 Kz

⭐ +320 XP

🏆 NOVO RECORDE!


Botões:

JOGAR NOVAMENTE
CONTINUAR
MAPA


73. MAPA DE CAMPANHA

Criar tela:

        🗺️ LUANDA

          🔒 TERMINAL

              │

          🔒 CENTRO

              │

          🔒 CAMAMA

              │

          🔒 TALATONA

              │

          🔓 SAMBA

              │

          🔓 RANGEL

              │

          🟢 BAIRRO


No MVP:

somente primeira área desbloqueada.

74. PERSONAGEM / CUSTOMIZAÇÃO

Criar tela:

        PERSONAGEM

           🧍

Roupa
[ ← → ]

Calça
[ ← → ]

Calçado
[ ← → ]

Acessório
[ ← → ]

[ GUARDAR ]


75. MISSÕES

Tela:

🎯 MISSÕES

☑ Lotar 3 táxis
   +500 Kz

☐ Lotar 5 táxis
   +800 Kz

☐ Fazer combo x5
   +500 Kz

☐ Ganhar 2.000 Kz
   +1.000 XP


76. DEFINIÇÕES

Criar:

⚙️ DEFINIÇÕES

Música      ON/OFF

Efeitos     ON/OFF

Vibração    ON/OFF

Qualidade   LOW/MEDIUM/HIGH

Idioma      Português


Preparar internacionalização para:

Português;

Inglês.

O idioma padrão deve ser:

Português.

77. PERSONALIDADE

O jogo deve ter personalidade angolana.

Utilizar expressões leves e naturais.

Exemplos:

"Entra, entra!"

"Já está quase cheio!"

"Falta só um!"

"Viana!"

"Talatona!"

"Centro!"

"Corre!"

"Esse táxi vai sair!"

"Boa!"

"Perdeste!"

"Vamos novamente!"


Não exagerar no uso de gírias.

O jogo deve continuar compreensível.

78. EVITAR

Não utilizar:

estereótipos ofensivos;

caricaturas raciais;

violência;

criminalização dos trabalhadores;

representação depreciativa de Angola;

marcas reais;

pessoas reais;

propaganda política.

O jogo deve apresentar os personagens com respeito.

79. ARQUITETURA

Evitar um único arquivo gigantesco.

Separar:

Scenes
Entities
Systems
AI
UI
Data
Assets
Config


Utilizar:

classes;

interfaces;

enums;

eventos;

managers;

componentes.

80. CÓDIGO

Todo código deve:

ser TypeScript;

ser tipado;

ser legível;

ter comentários quando necessário;

evitar duplicação;

possuir tratamento de erros;

utilizar nomes claros.

81. README

Criar:

README.md


com:

descrição;

requisitos;

instalação;

npm install;

npm run dev;

npm run build;

npm run preview;

estrutura do projeto;

controles;

arquitetura;

como adicionar novos personagens;

como adicionar novos spritesheets;

como adicionar novos táxis;

como adicionar novos mapas.

82. PACKAGE.JSON

Criar scripts:

{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}


83. PRIMEIRA EXECUÇÃO

Quando executar:

npm install
npm run dev


deve abrir o jogo.

Não deixar erros críticos no console.

84. ORDEM DE DESENVOLVIMENTO

IMPORTANTE:

Não tente implementar tudo simultaneamente.

Trabalhe nesta ordem:

FASE 1

Projeto + Phaser + Vite + TypeScript.

FASE 2

Mapa.

FASE 3

Jogador.

FASE 4

Spritesheets + animações.

FASE 5

Táxis.

FASE 6

Passageiros.

FASE 7

Interação.

FASE 8

Lotação.

FASE 9

IA.

FASE 10

Economia.

FASE 11

XP.

FASE 12

Combo.

FASE 13

Power-ups.

FASE 14

Missões.

FASE 15

UI.

FASE 16

Áudio.

FASE 17

Save.

FASE 18

Otimização.

FASE 19

Mobile.

FASE 20

Polimento.

85. REGRA MAIS IMPORTANTE

Não avance simplesmente porque o código foi escrito.

Uma funcionalidade só deve ser considerada concluída quando estiver:

implementada + integrada + executável + testável.

86. DESENVOLVIMENTO INCREMENTAL

Ao terminar cada fase:

mostrar:

FASE CONCLUÍDA

Arquivos criados:
...

Funcionalidades:
...

Como testar:
...

Próxima fase:
...


Não apagar funcionalidades anteriores.

Não reescrever o projeto inteiro a cada fase.

Manter compatibilidade.

87. PRIMEIRO OBJETIVO

Comece criando o VERTICAL SLICE COMPLETO.

Ele deve conter:

1 mapa

1 personagem jogável

2 NPCs

3 tipos de passageiros

2 tipos de táxis

3 destinos

spritesheets

animações

movimento

corrida

stamina

interação

IA

competição

lotação

Kz

XP

combo

power-up

HUD

partida de 3 minutos

resultado

save local


88. CRITÉRIO FINAL DO VERTICAL SLICE

Eu devo conseguir:

ABRIR
 ↓
JOGAR
 ↓
CORRER
 ↓
ENCONTRAR PASSAGEIRO
 ↓
CONCORRER COM NPC
 ↓
PEGAR PASSAGEIRO
 ↓
LEVAR AO TÁXI
 ↓
LOTAR TÁXI
 ↓
GANHAR KZ
 ↓
GANHAR XP
 ↓
CRIAR COMBO
 ↓
TERMINAR PARTIDA
 ↓
VER RESULTADO
 ↓
JOGAR NOVAMENTE


Tudo isso deve funcionar.

89. QUALIDADE VISUAL

Não entregar uma interface genérica.

Criar identidade visual própria para:

LOTADOR

Usar:

tipografia consistente;

ícones;

animações;

sombras;

profundidade;

partículas;

feedback;

transições.

A interface deve parecer um jogo comercial independente.

90. RESULTADO FINAL

Quero que o resultado pareça um jogo real chamado:

LOTADOR

com:

🚐 táxis

👥 passageiros

🏃 lotadores

🗺️ Luanda estilizada

💰 Kz virtual

🔥 combos

⚡ power-ups

🎯 missões

⭐ XP

👕 personalização

🏆 progressão

🎵 áudio

🎨 spritesheets

🎞️ animações

📱 controles mobile

91. COMEÇAR AGORA

Comece imediatamente pela:

FASE 1 — FUNDAÇÃO DO PROJETO

Crie:

package.json;

Vite;

TypeScript;

Phaser;

estrutura de pastas;

main.ts;

BootScene;

PreloadScene;

MainMenuScene;

GameScene;

configuração inicial;

sistema básico de assets;

sistema de cenas;

README.

Depois implemente progressivamente as fases seguintes.

NÃO gere apenas pseudocódigo.

NÃO entregue apenas explicações.

CRIE O CÓDIGO REAL.

Quando um asset gráfico não puder ser gerado diretamente, crie um placeholder funcional e deixe a arquitetura preparada para substituí-lo por um spritesheet profissional.

O resultado final deve ser um jogo realmente executável, e não apenas uma interface simulando um jogo.

LOTADOR

CORRE. CHAMA. LOTA. GANHA.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4b8070a0-a0dd-452c-a2b7-ed2980052604).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
