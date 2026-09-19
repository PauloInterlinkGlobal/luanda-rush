import { SaveManager } from "./SaveManager";

/**
 * Feedback háptico / utilitários de UX.
 * Respeita settings.vibration do save.
 */
export function vibrate(pattern: number | number[] = 12): void {
  try {
    const on = SaveManager.load().settings?.vibration !== false;
    if (!on) return;
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    /* browsers / iframes podem bloquear */
  }
}

export function vibrateReward(): void {
  vibrate([8, 30, 12]);
}

export function vibrateFail(): void {
  vibrate([20, 40, 20]);
}

export function vibrateLight(): void {
  vibrate(8);
}
