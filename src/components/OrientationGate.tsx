import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { useCallback, useEffect, useState } from "react";

/**
 * Pede ecrã inteiro e tenta trancar a orientação em paisagem.
 * O Fullscreen API e o Screen Orientation API só podem ser chamados a
 * partir de um gesto do utilizador (toque), por isso isto é invocado
 * a partir do botão do overlay e também numa primeira tentativa silenciosa.
 */
async function goFullscreenLandscape(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await ScreenOrientation.lock({ type: "landscape" });
    } catch {
      /* Algumas versões do sistema ignoram o lock; o jogo continua utilizável. */
    }
    return;
  }
  const el = document.documentElement as HTMLElement & {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  };
  try {
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    }
  } catch {
    /* iOS Safari (iPhone) não suporta Fullscreen API — segue sem ele */
  }
  try {
    const orientation = screen.orientation as unknown as {
      lock?: (o: string) => Promise<void>;
    };
    await orientation.lock?.("landscape");
  } catch {
    /* Orientation Lock só funciona em Chrome/Android e dentro de fullscreen */
  }
}

function isPortraitNow(): boolean {
  if (typeof window === "undefined") return false;
  // window.orientation é o sinal mais fiável em iOS Safari; matchMedia cobre o resto.
  return window.matchMedia("(orientation: portrait)").matches;
}

/**
 * Envolve o jogo: mostra sempre o canvas a ocupar o ecrã todo e, quando o
 * telemóvel está em modo retrato, cobre tudo com um aviso a pedir para
 * rodar o aparelho — o jogo só é jogável na horizontal.
 */
export function OrientationGate({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState<boolean>(isPortraitNow);

  useEffect(() => {
    const mql = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(isPortraitNow());
    update();
    mql.addEventListener("change", update);
    window.addEventListener("resize", update);
    void goFullscreenLandscape();

    // Fullscreen/orientation lock exigem um gesto do utilizador — a primeira
    // vez que o jogador toca no ecrã (mesmo já em paisagem) tentamos de novo.
    const onFirstGesture = () => {
      void goFullscreenLandscape();
    };
    document.addEventListener("pointerdown", onFirstGesture, { once: true });

    return () => {
      mql.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("pointerdown", onFirstGesture);
    };
  }, []);

  const handleActivate = useCallback(() => {
    void goFullscreenLandscape();
  }, []);

  return (
    <div className="fixed inset-0 h-[100dvh] w-[100dvw] overflow-hidden bg-[#0e1a33]">
      {children}
      {isPortrait && (
        <div
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center gap-6 bg-[#0e1a33] px-8 text-center"
          onClick={handleActivate}
          role="button"
          tabIndex={0}
        >
          <svg
            className="lotador-rotate-icon h-20 w-20 text-[#ffc31f]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <rect x="5" y="2" width="14" height="20" rx="2.2" />
            <line x1="12" y1="18.2" x2="12.01" y2="18.2" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <p
            className="text-2xl font-bold text-[#ffc31f]"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            RODA O TELEMÓVEL
          </p>
          <p className="max-w-xs text-sm text-[#9fb0cc]" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            O LOTADOR só se joga na horizontal. Roda o teu telemóvel para continuar.
          </p>
        </div>
      )}
    </div>
  );
}
