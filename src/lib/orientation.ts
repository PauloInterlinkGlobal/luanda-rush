/**
 * Utilitários para forçar o jogo a rodar em modo horizontal (landscape),
 * em ecrã cheia (fullscreen), no telemóvel.
 *
 * Notas:
 * - `requestFullscreen` e `screen.orientation.lock` exigem um gesto do
 *   utilizador (toque/clique). Por isso são chamados no primeiro toque.
 * - No iOS (Safari) a API de orientação não existe; nesse caso o bloqueio
 *   é garantido via `orientation: "landscape"` no manifest (PWA instalado)
 *   e via overlay que obriga o utilizador a rodar o telefone.
 */

/** Devolve true quando o viewport está em modo retrato (altura > largura). */
export function isPortrait(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
}

/** Heurística simples para detetar telemóvel/tablet (ponteiro "coarse"). */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(pointer: coarse)").matches ||
    "ontouchstart" in window
  );
}

type LockableOrientation = {
  lock?: (orientation: string) => Promise<void>;
};

/** Tenta bloquear a orientação do ecrã em horizontal. Falha em silêncio. */
export async function lockLandscape(): Promise<void> {
  const orientation = (window.screen as { orientation?: LockableOrientation })
    .orientation;
  if (!orientation?.lock) return;
  try {
    await orientation.lock("landscape");
  } catch {
    // Sem gesto do utilizador ou browser sem suporte — ignorar.
  }
}

/** Entra em ecrã cheia (com fallback webkit). Falha em silêncio. */
export async function enterFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) return;
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
    }
  } catch {
    // iOS Safari não suporta Fullscreen API no iPhone — ignorar.
  }
}

/**
 * Entra em ecrã cheia e trava a orientação em horizontal.
 * Deve ser invocada dentro de um gesto do utilizador.
 */
export async function enterImmersiveLandscape(): Promise<void> {
  await enterFullscreen();
  await lockLandscape();
}
