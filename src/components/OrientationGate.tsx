import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { useCallback, useEffect, useState } from "react";

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
    const orientation = screen.orientation as ScreenOrientation & { lock?: (type: string) => Promise<void> };
    await orientation.lock?.("landscape");
    return true;
  } catch {
    return false;
  }
};

async function goFullscreenLandscape(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    return landscapeLock();
  }

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
    // iOS Safari não expõe Fullscreen API completo; tentamos o lock abaixo.
  }

  return landscapeLock();
}

function isPortraitNow(): boolean {
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
    void goFullscreenLandscape();

    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleActivate = useCallback(async () => {
    setIsTrying(true);
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
        <section className="fixed inset-0 z-[999999] flex min-h-[100dvh] w-full items-center justify-center overflow-y-auto bg-[#0b0f1c]/90 px-5 py-8 text-center backdrop-blur-[7px]" aria-modal="true" role="dialog" aria-labelledby="orientation-title">
          <div className="flex w-full max-w-[430px] flex-col items-center gap-4 text-[#c7d1e0]">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8492ab]">PARAGEM 01 · LUANDA</p>
            <div className="relative flex h-[174px] w-[190px] items-center justify-center">
              <div className="absolute h-40 w-40 animate-[orientation-radar_1.8s_ease-in-out_infinite] rounded-full border border-dashed border-[#ffc31f]/70" />
              <div className="lotador-rotate-icon relative flex h-[118px] w-[72px] items-center justify-center rounded-[16px] border-[3px] border-[#ffc31f] bg-[#122344] shadow-[0_0_30px_rgba(255,195,31,0.28)]">
                <div className="absolute top-2 h-1 w-7 rounded-full bg-[#ffc31f]" />
                <div className="flex h-14 w-12 items-center justify-center rounded-lg border border-[#ffc31f]/70 bg-[#0b0f1c] font-serif text-[10px] font-black tracking-tight text-[#ffc31f]">LOTADOR</div>
                <div className="absolute bottom-2 h-1 w-1 rounded-full bg-[#ffc31f]" />
              </div>
              <div className="absolute bottom-2 right-7 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0b0f1c] bg-[#f07820] text-xl font-bold text-white shadow-lg" aria-hidden="true">↻</div>
            </div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#ffc31f]">⚙ MODO PAISAGEM OBRIGATÓRIO</p>
            <h1 id="orientation-title" className="font-serif text-[30px] font-black leading-none text-white">Vire o seu dispositivo</h1>
            <p className="max-w-[360px] font-sans text-sm leading-6 text-[#c7d1e0]">Por favor, coloque o seu ecrã na <strong className="text-white">posição horizontal (paisagem)</strong> para jogar.</p>
            <p className="font-sans text-xs italic text-[#e0ad38]">Os candongueiros de Luanda precisam da estrada aberta.</p>
            <button type="button" onClick={handleActivate} disabled={isTrying} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff9a1f] to-[#ffc31f] px-5 py-4 font-serif text-sm font-black tracking-wide text-[#0b0f1c] shadow-[0_8px_24px_rgba(255,175,31,0.3)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"><span className="text-xl leading-none">⤢</span>{isTrying ? "A TENTAR..." : "ATIVAR ECRÃ INTEIRO E BLOQUEAR"}</button>
            <button type="button" onClick={handleLockOnly} className="font-sans text-xs font-bold tracking-[0.16em] text-[#ffc31f] underline underline-offset-4">BLOQUEAR ORIENTAÇÃO</button>
            <p className={`max-w-[350px] font-sans text-[11px] leading-5 text-[#8492ab] transition-opacity ${showHelp ? "opacity-100" : "opacity-80"}`}>Se o ecrã não rodar sozinho, certifique-se de que a <strong className="text-[#c7d1e0]">Rotação Automática</strong> está ativa nas definições do seu telemóvel.</p>
          </div>
        </section>
      )}
    </div>
  );
}
