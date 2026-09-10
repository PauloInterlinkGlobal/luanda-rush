import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const output = ".output/public";
const assets = await readdir(join(output, "assets"));
const script = assets.find((file) => file.startsWith("index-") && file.endsWith(".js"));
const css = assets.find((file) => file.startsWith("styles-") && file.endsWith(".css"));
if (!script) throw new Error("Não foi encontrado o bundle principal do Vite.");
const html = `<!doctype html><html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><meta name="theme-color" content="#0e1a33"><link rel="manifest" href="/manifest.webmanifest">${css ? `<link rel="stylesheet" href="/assets/${css}">` : ""}</head><body><div id="root"></div><script type="module" src="/assets/${script}"></script></body></html>`;
await writeFile(join(output, "index.html"), html);
await mkdir("android", { recursive: true });
