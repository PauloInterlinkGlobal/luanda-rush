import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { preloadGameAssets, registerPwa } from "../lib/pwa";
import { createGame } from "../game";

function isPortrait(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
}

async function requestLandscapeFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;

  try {
    // Fullscreen is normally allowed only after a user gesture.
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    }
  } catch {
    // Some browsers/PWA modes already run fullscreen or do not expose the API.
  }

  try {
    // Supported on modern mobile browsers and installed PWAs.
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: OrientationLockType) => Promise<void>;
    };
    await orientation.lock?.("landscape");
  } catch {
    // The manifest/CSS orientation gate remains the fallback.
  }
}

export default function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [portrait, setPortrait] = useState(isPortrait);

  useEffect(() => {
    const updateOrientation = () => setPortrait(isPortrait());

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    screen.orientation?.addEventListener?.("change", updateOrientation);

    // Best-effort attempt. If the browser requires a gesture, the gate button
    // will perform the same operation after the player taps it.
    void requestLandscapeFullscreen();

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
      screen.orientation?.removeEventListener?.("change", updateOrientation);
    };
  }, []);

  useEffect(() => {
    if (portrait) {
      gameRef.current?.pause?.();
      return;
    }

    let cancelled = false;
    const el = ref.current;
    if (!el) return;

    void requestLandscapeFullscreen();

    void registerPwa().catch(() => undefined);
    void preloadGameAssets()
      .then(() => {
        if (cancelled || isPortrait()) return;
        gameRef.current = createGame(el);
      })
      .catch((error: unknown) => {
        console.error("[Lotador] Falha ao iniciar o jogo:", error);
      });

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [portrait]);

  if (portrait) {
    return (
      <div className="lotador-orientation-gate" role="dialog" aria-modal="true">
        <div className="lotador-orientation-card">
          <div className="lotador-phone-icon" aria-hidden="true">↻</div>
          <h1>Vire o telefone</h1>
          <p>
            O LOTADOR só pode ser jogado na horizontal.
            <br />
            Gire o telefone para continuar.
          </p>
          <button
            type="button"
            onClick={() => void requestLandscapeFullscreen()}
            className="lotador-orientation-button"
          >
            Girar e entrar no jogo
          </button>
        </div>
      </div>
    );
  }

  return <div ref={ref} className="lotador-game-container" />;
}
