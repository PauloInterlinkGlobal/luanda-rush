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
