import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { useCallback, useEffect, useState } from "react";

const getWebOrientation = () =>
  typeof screen !== "undefined" ? screen.orientation : undefined;

const landscapeLock = async (): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await ScreenOrientation.lock({ type: "landscape" });
      return true;
    } catch {
      return false;
    }
  }

  try {
    const orientation = getWebOrientation();
    if (!orientation?.lock) return false;
    await orientation.lock("landscape");
    return true;
  } catch {
    return false;
  }
};

async function goFullscreenLandscape(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) return landscapeLock();

  const root = document.documentElement as HTMLElement & {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  };

  try {
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) await root.requestFullscreen();
      else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
    }
  } catch {
    // Safari iOS não expõe a Fullscreen API completa.
  }

  return landscapeLock();
}

function isPortraitNow() {
  return typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches;
}

export function OrientationGate({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState(isPortraitNow);
  const [showHelp, setShowHelp] = useState(false);
  const [isTrying, setIsTrying] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(isPortraitNow());
    update();
    media.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleActivate = useCallback(async () => {
    setIsTrying(true);
    setShowHelp(false);
    const locked = await goFullscreenLandscape();
    if (!locked) setShowHelp(true);
    setIsTrying(false);
  }, []);

  const handleLockOnly = useCallback(async () => {
    setIsTrying(true);
    const locked = await landscapeLock();
    if (!locked) setShowHelp(true);
    setIsTrying(false);
  }, []);

  return (
    <div className="fixed inset-0 h-[100dvh] w-[100dvw] overflow-hidden bg-[#0b0f1c]">
      {children}
      {isPortrait && (
        <section
          className="orientation-gate fixed inset-0 z-[999999] flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#0b0f1c]/75 px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-center backdrop-blur-[7px]"
          aria-modal="true"
          role="dialog"
          aria-labelledby="orientation-title"
        >
          <div className="orientation-content flex w-full max-w-sm flex-col items-center gap-[clamp(.55rem,2.5vh,1rem)] text-[#c7d1e0]">
            <p className="font-sans text-[clamp(.65rem,2.5vw,.8rem)] font-semibold uppercase tracking-[.28em] text-[#8492ab]">PARAGEM 01 · LUANDA</p>
            <div className="orientation-logo" aria-label="Lotador">
              <span>LOTADOR</span>
            </div>
            <div className="relative flex h-[clamp(8.5rem,40vw,13.75rem)] w-[clamp(8.5rem,40vw,13.75rem)] items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-[#ffc31f]/70 animate-[orientation-radar_1.8s_ease-in-out_infinite]" />
              <div className="lotador-rotate-icon relative flex h-[58%] w-[38%] items-center justify-center rounded-[1.2rem] border-[3px] border-[#ffc31f] bg-[#122344] shadow-[0_0_30px_rgba(255,195,31,.3)]">
                <div className="absolute top-[5%] h-1 w-8 rounded-full bg-[#ffc31f]" />
                <div className="flex h-[48%] w-[68%] items-center justify-center rounded-lg border border-[#ffc31f]/70 bg-[#0b0f1c] font-serif text-[clamp(.45rem,2vw,.65rem)] font-black tracking-tight text-[#ffc31f]">LOTADOR</div>
                <div className="absolute bottom-[5%] h-1 w-1 rounded-full bg-[#ffc31f]" />
              </div>
              <div className="absolute bottom-[7%] right-[10%] flex aspect-square w-[clamp(2.5rem,13vw,3.5rem)] items-center justify-center rounded-full border-2 border-[#0b0f1c] bg-[#f07820] text-xl font-bold text-white shadow-lg" aria-hidden="true">↻</div>
            </div>
            <p className="font-sans text-[clamp(.7rem,2.8vw,.85rem)] font-semibold uppercase tracking-[.16em] text-[#ffc31f]">⚙ MODO PAISAGEM OBRIGATÓRIO</p>
            <h1 id="orientation-title" className="text-balance font-serif text-[clamp(1.5rem,6vw,2rem)] font-black leading-tight text-white">Vire o seu dispositivo</h1>
            <p className="max-w-sm text-pretty font-sans text-[clamp(.85rem,3.5vw,1rem)] leading-relaxed text-[#c7d1e0]">Por favor, coloque o seu ecrã na <strong className="text-white">posição horizontal (paisagem)</strong> para jogar.</p>
            <p className="font-sans text-[clamp(.72rem,3vw,.85rem)] italic text-[#e0ad38]">Os candongueiros de Luanda precisam da estrada aberta.</p>
            <button type="button" onClick={handleActivate} disabled={isTrying} className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff9a1f] to-[#ffc31f] px-4 py-3 font-serif text-xs font-black tracking-wide text-[#0b0f1c] shadow-[0_8px_24px_rgba(255,175,31,.3)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"> <span className="text-xl leading-none">⤢</span>{isTrying ? "A TENTAR..." : "ATIVAR ECRÃ INTEIRO E BLOQUEAR"}</button>
            <button type="button" onClick={handleLockOnly} className="min-h-11 px-4 font-sans text-xs font-bold tracking-[.16em] text-[#ffc31f] underline underline-offset-4">BLOQUEAR ORIENTAÇÃO</button>
            <p className={`max-w-sm font-sans text-[clamp(.65rem,2.5vw,.75rem)] leading-relaxed text-[#8492ab] transition-colors ${showHelp ? "text-[#ffc31f]" : ""}`}>Se o ecrã não rodar sozinho, certifique-se de que a <strong className="text-[#c7d1e0]">Rotação Automática</strong> está ativa nas definições do seu telemóvel.</p>
          </div>
        </section>
      )}
    </div>
  );
}

/* Referências: 320px mantém o botão visível; 390px amplia o respiro; 768px centraliza sem esticar. */

export default OrientationGate;
