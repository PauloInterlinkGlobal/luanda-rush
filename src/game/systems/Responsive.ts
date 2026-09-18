import Phaser from "phaser";

/**
 * Sistema de escala responsiva partilhado por todas as cenas.
 *
 * Regras:
 *  - O canvas mede sempre a largura/altura útil do dispositivo (Scale.RESIZE).
 *  - A escala é UNIFORME e calculada a partir de uma ALTURA DE REFERÊNCIA.
 *    Nunca se aplicam escalas diferentes em X e Y, por isso personagens,
 *    táxis, props e textos mantêm a proporção original.
 *  - A largura extra dos ecrãs largos é usada para mostrar MAIS CENÁRIO
 *    (mais área visível de câmara), nunca para esticar a imagem.
 */

/** Resolução lógica de referência (só para derivar escalas, nunca fixa o canvas). */
export const REFERENCE = { width: 960, height: 540 } as const;

export type SafeInsets = { top: number; right: number; bottom: number; left: number };

const NO_INSETS: SafeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

let probe: HTMLDivElement | null = null;

/** Lê as safe areas (recortes/barras do sistema) expostas pelo CSS env(). */
export function safeInsets(): SafeInsets {
  if (typeof document === "undefined" || !document.body) return NO_INSETS;
  if (!probe || !probe.isConnected) {
    probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "width:0",
      "height:0",
      "visibility:hidden",
      "pointer-events:none",
      "padding-top:env(safe-area-inset-top,0px)",
      "padding-right:env(safe-area-inset-right,0px)",
      "padding-bottom:env(safe-area-inset-bottom,0px)",
      "padding-left:env(safe-area-inset-left,0px)",
    ].join(";");
    document.body.appendChild(probe);
  }
  const css = getComputedStyle(probe);
  const px = (v: string) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    top: px(css.paddingTop),
    right: px(css.paddingRight),
    bottom: px(css.paddingBottom),
    left: px(css.paddingLeft),
  };
}

export interface Layout {
  /** Dimensões reais do canvas (= ecrã útil). */
  width: number;
  height: number;
  cx: number;
  cy: number;
  /** Escala uniforme derivada da altura de referência. */
  scale: number;
  /** Escala uniforme para HUD/menus (limita gigantismo em ecrãs muito altos). */
  uiScale: number;
  safe: SafeInsets;
  /** Bordas úteis já com safe area + margem mínima. */
  left: number;
  right: number;
  top: number;
  bottom: number;
  innerWidth: number;
  innerHeight: number;
  /** Converte uma medida de referência para píxeis do ecrã (uniforme). */
  s: (value: number) => number;
  /** Tamanho de fonte escalado, em string pronta para Phaser.Text. */
  font: (value: number) => string;
  /** Interpolação horizontal dentro da área útil (0..1). */
  x: (t: number) => number;
  /** Interpolação vertical dentro da área útil (0..1). */
  y: (t: number) => number;
}

/** Calcula o layout actual da cena. Deve ser chamado em cada create()/resize. */
export function layoutOf(scene: Phaser.Scene, margin = 12): Layout {
  const width = Math.max(1, Math.round(scene.scale.width));
  const height = Math.max(1, Math.round(scene.scale.height));
  const safe = safeInsets();

  // Escala uniforme: baseada só na altura — largura extra vira mais cenário.
  const scale = Phaser.Math.Clamp(height / REFERENCE.height, 0.5, 2);
  // HUD/menus: em ecrãs baixos encolhe de forma uniforme, mantendo toques ~44px.
  const uiScale = Phaser.Math.Clamp(
    Math.min(height / REFERENCE.height, width / (REFERENCE.width * 0.82)),
    0.62,
    1.45,
  );

  const m = margin * uiScale;
  const left = safe.left + m;
  const right = width - safe.right - m;
  const top = safe.top + m;
  const bottom = height - safe.bottom - m;

  return {
    width,
    height,
    cx: width / 2,
    cy: height / 2,
    scale,
    uiScale,
    safe,
    left,
    right,
    top,
    bottom,
    innerWidth: Math.max(1, right - left),
    innerHeight: Math.max(1, bottom - top),
    s: (value: number) => value * uiScale,
    font: (value: number) => `${Math.max(8, Math.round(value * uiScale))}px`,
    x: (t: number) => left + (right - left) * t,
    y: (t: number) => top + (bottom - top) * t,
  };
}

/**
 * Regista um handler de resize/mudança de orientação com limpeza automática
 * no SHUTDOWN/DESTROY da cena. Não corre imediatamente.
 */
export function onResize(scene: Phaser.Scene, handler: () => void): () => void {
  let frame = 0;
  const wrapped = () => {
    // Coalesce vários eventos (rotação dispara resize em rajada).
    if (frame) return;
    frame =
      window.requestAnimationFrame?.(() => {
        frame = 0;
        if (scene.scene.isActive() || scene.scene.isPaused()) handler();
      }) ?? 0;
    if (!frame) handler();
  };
  scene.scale.on(Phaser.Scale.Events.RESIZE, wrapped);
  const off = () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, wrapped);
    if (frame) window.cancelAnimationFrame?.(frame);
    frame = 0;
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
  scene.events.once(Phaser.Scenes.Events.DESTROY, off);
  return off;
}

/**
 * Cenas puramente declarativas (menus, painéis) voltam a desenhar-se do zero
 * quando o ecrã muda de tamanho ou orientação — sem recarregar a página.
 */
export function relayoutOnResize(scene: Phaser.Scene, render: (layout: Layout) => void): void {
  onResize(scene, () => render(layoutOf(scene)));
}

/** Reinicia a cena no resize (usado quando o redesenho total é mais simples). */
export function restartOnResize(scene: Phaser.Scene): void {
  let last = `${Math.round(scene.scale.width)}x${Math.round(scene.scale.height)}`;
  onResize(scene, () => {
    const next = `${Math.round(scene.scale.width)}x${Math.round(scene.scale.height)}`;
    if (next === last) return;
    last = next;
    if (scene.scene.isActive()) scene.scene.restart();
  });
}

/**
 * Cobre toda a área visível com uma imagem, SEM deformar:
 * escolhe a maior escala uniforme que cobre a caixa pedida (tipo `object-fit: cover`).
 */
export function coverUniform(
  image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  boxWidth: number,
  boxHeight: number,
): void {
  const texW = image.width || 1;
  const texH = image.height || 1;
  const factor = Math.max(boxWidth / texW, boxHeight / texH);
  image.setScale(factor); // mesma escala nos dois eixos → sem esticar
}
