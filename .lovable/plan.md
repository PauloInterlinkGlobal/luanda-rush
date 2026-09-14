# Ecrã inteiro responsivo, sem deformação

## Objetivo
Fazer o LOTADOR ocupar 100% do ecrã do telemóvel, tablet ou computador, sem margens, bordas ou faixas vazias, mantendo personagens, táxis e objetos nas proporções corretas. Quando o ecrã for mais largo, o jogador verá mais cenário em vez de o jogo ser esticado.

## Implementação
1. **Criar uma escala responsiva única para todas as cenas**
   - Manter o canvas exatamente no tamanho útil do dispositivo, incluindo mudanças de orientação e barras móveis do navegador.
   - Calcular uma escala uniforme a partir de uma altura de referência; aplicar a mesma escala nos dois eixos para impedir deformações.
   - Usar a largura restante para ampliar a área visível do mapa, sem aumentar artificialmente personagens ou objetos.

2. **Adaptar a câmara e o cenário da partida**
   - Atualizar o zoom e o viewport da câmara sempre que o ecrã mudar de tamanho.
   - Preservar os limites do mapa e centrar corretamente a câmara perto das extremidades.
   - Garantir que o fundo cobre toda a área visível, sem faixas, e que os sprites reais conservam a proporção original.

3. **Tornar o HUD mobile-first**
   - Reposicionar energia, objetivos, dinheiro, tempo, pausa, joystick e botões a partir das bordas do ecrã.
   - Aplicar uma escala uniforme aos controlos em ecrãs baixos, mantendo áreas de toque confortáveis e sem sobreposição.
   - Respeitar as zonas seguras de telemóveis com recortes ou barras do sistema.
   - Recalcular o tutorial, destaques e mensagens quando houver resize ou mudança de orientação.

4. **Corrigir menus e painéis sobrepostos**
   - Converter Menu, Personagem, Pausa, Resultado e carregamento para layouts baseados no espaço disponível, não em posições fixas de 960×540.
   - No menu, reorganizar ou compactar o guia “Como jogar” e os botões em ecrãs baixos para que nada fique cortado.
   - Dimensionar textos, painéis e botões proporcionalmente, sempre sem esticar sprites.

5. **Garantir full-bleed na Web e Android**
   - Remover qualquer margem, padding, borda, scroll ou limite de tamanho nos contentores do jogo.
   - Confirmar que o WebView Android usa toda a área disponível em paisagem e que o fundo cobre também as zonas seguras.
   - Manter o bloqueio/orientação horizontal existente sem introduzir um tamanho fixo.

6. **Validar em dispositivos diferentes**
   - Testar proporções comuns de telemóvel em paisagem, ecrã ultralargo e tablet.
   - Confirmar: canvas encostado aos quatro lados, zero scroll/faixas, sprites sem deformação, mais cenário em ecrãs largos, HUD legível e todos os botões acessíveis.
   - Verificar menu, tutorial, partida, pausa, personagem e resultado, além de erros gráficos no navegador.

## Critérios de aceitação
- O canvas mede exatamente a largura e altura visíveis do dispositivo.
- Não existem margens, bordas, padding ou letterbox em nenhuma cena.
- Personagens, NPCs, táxis e objetos nunca ficam achatados ou alongados.
- Ecrãs mais largos mostram mais cenário; não esticam a imagem.
- Nenhum texto, painel ou controlo fica cortado ou sobreposto nas proporções testadas.
- A alteração de tamanho ou orientação reorganiza o jogo sem exigir recarregar a página.

## Prompt reutilizável
> Torna o jogo Phaser 3 mobile-first e totalmente responsivo. O canvas deve preencher 100% da largura e da altura útil do dispositivo, sem margens, padding, bordas, scroll ou faixas vazias. Não uses dimensões fixas para ajustar a apresentação e nunca estiques o canvas ou os sprites de forma não uniforme. Mantém a proporção original de personagens, NPCs, táxis, objetos e textos. Usa escala uniforme baseada na altura de referência e, em ecrãs mais largos, aumenta a área visível da câmara para mostrar mais cenário. Recalcula câmara, fundo, HUD, controlos táteis, menus, painéis e tutoriais em cada resize ou mudança de orientação. Ancora o HUD às bordas, respeita safe areas e evita qualquer sobreposição ou conteúdo cortado. Valida em vários telemóveis em paisagem, ecrãs ultralargos e tablets.
