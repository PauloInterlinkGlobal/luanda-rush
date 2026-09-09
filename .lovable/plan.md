# Nível 1 como tutorial puro

O nível 1 já tem uma camada guiada, mas ainda corre como uma partida normal: aparecem vários táxis e vários passageiros ao longo do tempo, o objetivo pede 2 passageiros e "lotar 1 táxi" (o que exige 4 pessoas no mesmo táxi, impossível com um só passageiro), e as posições são sorteadas. Este plano fecha essas falhas usando os sistemas que já existem.

## O que muda para quem joga

1. **Cronómetro**: continua parado durante a introdução e depois do botão COMEÇAR; só arranca no primeiro movimento real, uma única vez. (Já funciona assim — fica verificado.)
2. **Um único táxi**: um táxi Normal, sempre no mesmo lugar, perto do jogador. Não nasce mais nenhum durante o tutorial e este não desaparece por tempo de espera.
3. **Um único passageiro**: nasce sempre no mesmo sítio, entre o jogador e o táxi, com o destino do táxi. Se por algum motivo desistir, volta a aparecer no mesmo sítio — nunca há dois ao mesmo tempo.
4. **Posições próximas**: jogador ao centro do passeio, passageiro alguns passos à frente, táxi logo abaixo na estrada. Sem travessias longas.
5. **Zero rivais e zero roubos**: nenhum lotador adversário no nível 1 (já acontece), e o táxi do tutorial passa a ser um destino exclusivo do jogador.
6. **Sem eventos agressivos**: sem hora de ponta (já), sem perda de paciência que faça o passageiro fugir, sem penalizações.
7. **Objetivos simples e possíveis**: chamar um passageiro, usar a corrida e levar 1 passageiro ao táxi. Sai o objetivo "lotar 1 táxi" e o de 2 passageiros.
8. **Vitória / derrota**: vence ao completar os objetivos; só perde se o tempo (5 minutos) acabar. Reiniciar volta a montar tudo igual.
9. **Níveis seguintes** ficam exatamente como estão.

## Detalhes técnicos

- `src/game/config/MapConfig.ts`: novo bloco `tutorial` com `playerSpawn`, `passengerSpawn` e `taxiSlot` (índice do lugar existente), tudo dentro de uma área pequena à volta de (800, 540).
- `src/game/systems/SpawnManager.ts`:
  - `spawnPassenger(forceDestination?, at?)` aceita posição explícita;
  - `spawnTaxi(forceType?, forceSlot?)` aceita lugar fixo;
  - `tick(...)` ganha um parâmetro/flag de tutorial (ou recebe `maxTaxis = 1` e `maxPassengers = 1`) que impede o nascimento de novos táxis quando já existe um e mantém o teto de 1 passageiro.
- `src/game/scenes/GameScene.ts`:
  - no tutorial, jogador em `MAP_CONFIG.tutorial.playerSpawn`, táxi no lugar fixo, passageiro na posição fixa com o destino do táxi;
  - `spawns.tick` chamado com `maxTaxis = 1` no tutorial (hoje usa `2 + fleetLevel`);
  - se o passageiro do tutorial sair de cena antes de embarcar, respawn determinístico no mesmo ponto;
  - deixar o `TutorialController` reapontar o marcador para o novo passageiro (já suportado por `ensurePassenger`).
- `src/game/entities/Taxi.ts` / `Passenger.ts`: em modo tutorial, congelar o temporizador de espera do táxi e a paciência do passageiro (flag simples passada na criação ou lida de `scene.registry`), sem alterar o comportamento normal.
- `src/game/data/missions.ts`: `TUTORIAL_MISSIONS` passa a: `tut_chamar` (callsUsed 1), `tut_correr` (runsUsed 1), `tut_passageiro` (passengers 1). Remover `tut_taxi` (taxisFilled) e baixar o objetivo de passageiros para 1.
- Verificação com Playwright: iniciar nível 1, confirmar cronómetro parado até ao primeiro movimento, contar 1 táxi / 1 passageiro / 0 rivais, completar o ciclo chamar → convencer → embarcar → vitória, e confirmar que uma partida normal continua com vários táxis e rivais.
