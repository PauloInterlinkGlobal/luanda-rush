import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { preloadGameAssets, registerPwa } from "../lib/pwa";
import { SaveManager } from "../game/systems/SaveManager";
import { createGame } from "../game";
import { OrientationGate } from "./OrientationGate";

/** Monta o jogo Phaser (browser-only). */
export default function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;

    void registerPwa().catch(() => undefined);
    void Promise.all([preloadGameAssets(), SaveManager.hydrate()])
      .then(() => {
        if (cancelled) return;
        gameRef.current = createGame(el);
      })
      .catch((error: unknown) => {
        console.error("[v0] Falha ao iniciar o jogo:", error);
      });
    // O canvas deve seguir SEMPRE o tamanho útil real: barras móveis do
    // browser, teclado, rotação e mudanças de safe area disparam um refresh
    // da escala do Phaser — sem recarregar a página.
    const refresh = () => {
      const scale = gameRef.current?.scale;
      if (!scale) return;
      scale.resize(el.clientWidth || window.innerWidth, el.clientHeight || window.innerHeight);
      scale.refresh();
    };
    const schedule = () => window.requestAnimationFrame(refresh);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(el);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      observer?.disconnect();
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <OrientationGate>
      <div ref={ref} className="game-canvas-root" aria-label="Jogo Lotador" />
    </OrientationGate>
  );
}
