const isPreviewHost = (hostname: string) =>
  hostname.endsWith(".v0.build") ||
  hostname.endsWith(".lovable.app") ||
  hostname.includes("localhost");

export async function registerPwa(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const disabled = new URLSearchParams(window.location.search).get("sw") === "off";
  const inFrame = window.self !== window.top;
  const allowed =
    import.meta.env.PROD && !disabled && !inFrame && !isPreviewHost(window.location.hostname);
  if (!allowed) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    // Um Service Worker antigo continua a controlar a página atual até a
    // próxima navegação. No preview isso pode servir módulos Vite obsoletos
    // (por exemplo, Passenger.ts) e quebrar imports dinâmicos.
    if (navigator.serviceWorker.controller) {
      const reloadKey = "lotador-sw-clean-reload";
      if (sessionStorage.getItem(reloadKey) !== "1") {
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
        return;
      }
      sessionStorage.removeItem(reloadKey);
    }
    return;
  }
  await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
}

export function preloadGameAssets(): Promise<void> {
  const urls = ["/lotador_atlas_clean.png", "/player_sheet.png"];
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.decoding = "async";
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  ).then(() => undefined);
}
