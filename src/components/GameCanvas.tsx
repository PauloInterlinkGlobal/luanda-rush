import { useEffect, useRef, useState, useCallback } from "react";
import type Phaser from "phaser";
import { preloadGameAssets, registerPwa } from "../lib/pwa";
import { createGame } from "../game";

function isPortrait(): boolean {
  if (typeof window === "undefined") return false;
  // Prefer Screen Orientation API when available
  const type = window.screen?.orientation?.type;
  if (type) return type.startsWith("portrait");
  // Fallback: width < height (also covers desktop window resize)
  return window.innerWidth < window.innerHeight;
}

async function lockLandscape(): Promise<void> {
  try {
    const orient = window.screen?.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
    if (orient?.lock) {
      await orient.lock("landscape");
    }
  } catch {
    // Browsers often reject lock outside fullscreen / user gesture — ignore
  }
}

async function requestFullscreen(el: HTMLElement): Promise<void> {
  try {
    if (!document.fullscreenElement && el.requestFullscreen) {
      await el.requestFullscreen();
    }
  } catch {
    // User may deny; still play in browser chrome
  }
}

/** Monta o jogo Phaser (browser-only) em landscape + fullscreen. */
export default function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [portrait, setPortrait] = useState(false);

  const updateOrientation = useCallback(() => {
    const nowPortrait = isPortrait();
    setPortrait(nowPortrait);
    if (!nowPortrait) {
      void lockLandscape();
    }
  }, []);

  useEffect(() => {
    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    const orient = window.screen?.orientation;
    orient?.addEventListener?.("change", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
      orient?.removeEventListener?.("change", updateOrientation);
    };
  }, [updateOrientation]);

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;

    void registerPwa().catch(() => undefined);
    void preloadGameAssets()
      .then(() => {
        if (cancelled) return;
        gameRef.current = createGame(el);
        void lockLandscape();
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

  // Tenta fullscreen no primeiro toque/clique (obrigatório por política do browser)
  useEffect(() => {
    const onFirstGesture = () => {
      const el = ref.current ?? document.documentElement;
      void requestFullscreen(el);
      void lockLandscape();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="fixed inset-0 h-[100dvh] w-[100dvw] overflow-hidden bg-[#0e1a33]"
        style={{ touchAction: "none" }}
      />
      {portrait && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[#0e1a33] px-6 text-center"
          role="dialog"
          aria-modal="true"
          aria-label="Vire o telefone para jogar"
        >
          <div className="animate-pulse text-6xl" aria-hidden>
            📱↻
          </div>
          <p className="max-w-sm text-xl font-bold tracking-wide text-[#ffc31f]">
            Vire o telefone na horizontal
          </p>
          <p className="max-w-xs text-sm text-[#9fb0cc]">
            O LOTADOR só joga em ecrã deitado (landscape), a ocupar todo o ecrã.
          </p>
        </div>
      )}
    </>
  );
}
