import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { preloadGameAssets, registerPwa } from "../lib/pwa";
import { createGame } from "../game";

/** Monta o jogo Phaser (browser-only). */
export default function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;

    void registerPwa().catch(() => undefined);
    void preloadGameAssets()
      .then(() => {
        if (cancelled) return;
        gameRef.current = createGame(el);
      })
      .catch((error: unknown) => {
        console.error("[v0] Falha ao iniciar o jogo:", error);
      });
    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={ref} className="fixed inset-0 h-full w-full overflow-hidden" />;
}
