import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const GameCanvas = lazy(() => import("../components/GameCanvas"));
const MainMenu = lazy(() => import("../components/MainMenu"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LOTADOR — Chama, Lota, Ganha | Jogo arcade de Luanda" },
      {
        name: "description",
        content:
          "LOTADOR é um jogo arcade inspirado nos lotadores de táxi de Luanda: chama passageiros, enche candongueiros para Viana, Talatona e Centro e ganha Kz.",
      },
      { property: "og:title", content: "LOTADOR — Chama, Lota, Ganha" },
      {
        property: "og:description",
        content: "Corre pela paragem, convence passageiros e lota o táxi antes dos teus rivais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="fixed inset-0 m-0 h-[100dvh] w-[100dvw] overflow-hidden border-0 p-0 bg-[#0e1a33]">
      <h1 className="sr-only">LOTADOR — jogo arcade de lotadores de táxi em Luanda</h1>
      {/* Canvas do jogo (Phaser) — serve de fundo 3D desfocado atrás do menu. */}
      <ClientOnly fallback={<p className="text-[#ffc31f]">A carregar o jogo...</p>}>
        <Suspense fallback={<p className="text-[#ffc31f]">A carregar o jogo...</p>}>
          <GameCanvas />
        </Suspense>
      </ClientOnly>
      {/* Menu principal por cima do canvas. */}
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <MainMenu
            level={3}
            phase={5}
            kz={4808}
            stars={11}
            label="LOTADOR"
            hasUnclaimedMissions
            hasAvailableUpgrades
            onPlay={() => console.log("[menu] jogar")}
            onContinue={() => console.log("[menu] continuar")}
            onMissions={() => console.log("[menu] missões")}
            onUpgrades={() => console.log("[menu] upgrades")}
            onCharacter={() => console.log("[menu] personagem")}
            onSettings={() => console.log("[menu] definições")}
            onExit={() => console.log("[menu] sair")}
          />
        </Suspense>
      </ClientOnly>
    </main>
  );
}
