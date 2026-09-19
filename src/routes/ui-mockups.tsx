import { createFileRoute } from "@tanstack/react-router";
import LotadorUiMockups from "../components/ui-mockups/LotadorUiMockups";

export const Route = createFileRoute("/ui-mockups")({
  head: () => ({
    meta: [
      { title: "O Lotador — UI Mockups · Fases & Objectivos" },
      {
        name: "description",
        content:
          "Mockups de interface: selecção de fases por bairro e HUD de objectivos durante o jogo.",
      },
      { name: "theme-color", content: "#0e1a33" },
      { name: "screen-orientation", content: "landscape" },
    ],
  }),
  component: UiMockupsPage,
});

function UiMockupsPage() {
  return <LotadorUiMockups />;
}
