import { useEffect, useState } from "react";
import {
  enterImmersiveLandscape,
  isPortrait,
  isTouchDevice,
} from "../lib/orientation";

/**
 * Guarda de orientação:
 * 1. Em telemóveis, tenta entrar em ecrã cheia e travar a orientação em
 *    horizontal no primeiro toque do utilizador (gesto exigido pelo browser).
 * 2. Enquanto o ecrã estiver em retrato, cobre o jogo com um overlay que
 *    obriga o utilizador a rodar o telefone para a horizontal.
 */
export default function OrientationGuard() {
  const [portrait, setPortrait] = useState(() => isPortrait());

  useEffect(() => {
    const update = () => setPortrait(isPortrait());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    if (!isTouchDevice()) return;

    const onFirstGesture = () => {
      void enterImmersiveLandscape();
    };

    // Tentativa imediata (funciona se o browser já tiver um gesto válido).
    void enterImmersiveLandscape();

    // Browsers exigem um gesto do utilizador para fullscreen/orientação.
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
  }, []);

  if (!portrait) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[#0e1a33] px-8 text-center">
      <div className="animate-[rotate-phone_1.6s_ease-in-out_infinite]">
        <svg
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffc31f"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
        </svg>
      </div>
      <p className="text-2xl font-bold text-[#ffc31f]">
        Gira o telefone
      </p>
      <p className="max-w-xs text-sm text-[#c7d2e8]">
        Este jogo só funciona em modo horizontal. Roda o telemóvel para
        continuar a jogar.
      </p>
      <style>{`
        @keyframes rotate-phone {
          0%, 15% { transform: rotate(0deg); }
          45%, 65% { transform: rotate(90deg); }
          95%, 100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
