import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { preloadGameAssets, registerPwa } from "../lib/pwa";

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
      .then(() => import("../game"))
      .then(({ createGame }) => {
        if (cancelled) return;
        gameRef.current = createGame(el);
      });
    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={ref} className="h-screen w-screen" />;
}
