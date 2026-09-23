/**
 * MainMenu.tsx — Ecrã de MENU PRINCIPAL do jogo LOTADOR.
 *
 * Reproduz o referencial visual: painel vertical semi-transparente sobre
 * um fundo 3D desfocado, com título "LOTADOR", barra de estado, botão
 * JOGAR em destaque, botões secundários e painel "COMO JOGAR".
 *
 * O fundo 3D desfocado é injetado via prop `background` (um <canvas>/div do
 * Three.js ou do Phaser). Deixa-se o comentário abaixo onde plugar o canvas
 * real do motor 3D.
 *
 * Tipografia: Poppins (carregada no <head> em __root.tsx).
 * Ícones: lucide-react.
 */
import type { ReactNode } from "react";
import {
  Play,
  Users,
  ClipboardList,
  ArrowUp,
  User,
  Settings,
  LogOut,
  Star,
  Coins,
  Shield,
  Hand,
  ZoomIn,
  MousePointerClick,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   PROPS
   ───────────────────────────────────────────────────────── */
export interface MainMenuProps {
  /** Nível atual do jogador. */
  level: number;
  /** Fase actual dentro do nível. */
  phase: number;
  /** Saldo em Kwanzas. */
  kz: number;
  /** Total de estrelas conquistadas. */
  stars: number;
  /** Etiqueta do título de progresso (ex: "LOTADOR"). */
  label?: string;
  /** Mostra badge "!" no botão MISSÕES. */
  hasUnclaimedMissions?: boolean;
  /** Mostra badge "!" no botão UPGRADES. */
  hasAvailableUpgrades?: boolean;
  /** Fundo desfocado (canvas 3D / Phaser). Opcional. */
  background?: ReactNode;
  /** Handlers de clique (stubs). */
  onPlay: () => void;
  onContinue: () => void;
  onMissions: () => void;
  onUpgrades: () => void;
  onCharacter: () => void;
  onSettings: () => void;
  onExit: () => void;
}

/* ─────────────────────────────────────────────────────────
   HELPERS DE ESTILO
   ───────────────────────────────────────────────────────── */

/** Badge de notificação "!" amarelo, canto superior direito. */
function NotifyBadge() {
  return (
    <span
      className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#1A2642] bg-[#FFC107] text-[10px] font-bold leading-none text-[#1A2642] shadow"
      aria-label="Novidade"
    >
      !
    </span>
  );
}

/** Item da barra de estado (ícone + valor). */
function StatusItem({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1 whitespace-nowrap text-white">
      <Icon className="h-3.5 w-3.5 text-[#FFC107]" />
      <span className="text-[11px] font-semibold leading-none tracking-wide">{children}</span>
    </span>
  );
}

/** Separador vertical entre itens da barra de estado. */
function StatusDivider() {
  return <span className="h-3.5 w-px bg-white/15" aria-hidden />;
}

/* ─────────────────────────────────────────────────────────
   BOTÃO SECUNDÁRIO
   ───────────────────────────────────────────────────────── */
function MenuButton({
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 rounded-xl border border-[#4A6FA5]/70 bg-[#213A5C] px-4 py-2.5 text-left text-sm font-semibold text-white shadow-md transition-all duration-150 hover:border-[#7AA0D6] hover:bg-[#2A4A75] active:scale-[0.99]"
    >
      <Icon className="h-5 w-5 shrink-0 text-white/90 transition-colors group-hover:text-white" />
      <span className="tracking-wide">{label}</span>
      {badge ? <NotifyBadge /> : null}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   COLUNA "COMO JOGAR"
   ───────────────────────────────────────────────────────── */
function HowToColumn({
  title,
  icon: Icon,
  caption,
  highlight,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-1.5 px-2 py-2 text-center ${
        highlight ? "rounded-lg bg-white/[0.04]" : ""
      }`}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-[#9FB4D6]">
        {title}
      </span>
      <Icon className="h-7 w-7 text-white" strokeWidth={1.75} />
      <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-white">
        {caption}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────────────────── */
export default function MainMenu({
  level,
  phase,
  kz,
  stars,
  label = "LOTADOR",
  hasUnclaimedMissions = false,
  hasAvailableUpgrades = false,
  background,
  onPlay,
  onContinue,
  onMissions,
  onUpgrades,
  onCharacter,
  onSettings,
  onExit,
}: MainMenuProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      {/* ════════ FUNDO 3D DESFOCADO ════════
          Plugue aqui o canvas real do motor 3D (Three.js / Phaser).
          - Se `background` for passado, é renderizado com blur forte.
          - Caso contrário, usamos `backdrop-filter: blur()` para desfocar
            o que estiver atrás (ex: o canvas do Phaser renderizado como
            irmão por baixo deste menu) + um véu escuro de legibilidade. */}
      <div className="absolute inset-0">
        {background ? (
          <div
            className="absolute inset-0 scale-105"
            style={{ filter: "blur(10px) brightness(0.55)" }}
            aria-hidden
          >
            {background}
          </div>
        ) : (
          // Desfoca o conteúdo irmão (canvas do jogo) que está por baixo.
          <div
            className="absolute inset-0"
            style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            aria-hidden
          />
        )}
        {/* Véu escuro para legibilidade do painel. */}
        <div className="absolute inset-0 bg-[#0D1B2A]/70" aria-hidden />
      </div>

      {/* ════════ PAINEL PRINCIPAL ════════ */}
      <div
        className="relative flex max-h-[100dvh] w-full max-w-[420px] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-[#1A2642]/90 p-4 shadow-2xl sm:p-5"
        style={{ backdropFilter: "blur(6px)" }}
      >
        {/* ── TOPO: Título + subtítulo ── */}
        <header className="flex flex-col items-center pt-1 text-center">
          <h1
            className="text-4xl font-extrabold uppercase leading-none tracking-tight text-[#FFC107] sm:text-5xl"
            style={{
              textShadow:
                "0 0 12px rgba(255,152,0,0.85), 0 0 28px rgba(255,152,0,0.45), 0 2px 4px rgba(0,0,0,0.6)",
            }}
          >
            LOTADOR
          </h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.35em] text-white sm:text-xs">
            Chama, Lota, Ganha
          </p>
        </header>

        {/* ── BARRA DE ESTADO (pílula) ── */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-full border border-[#4A6FA5]/60 bg-[#0F1C33] px-4 py-2 shadow-inner">
          <StatusItem icon={Star}>
            NÍVEL <span className="text-[#FFD700]">{level}</span>
          </StatusItem>
          <StatusDivider />
          <StatusItem icon={Shield}>{label}</StatusItem>
          <StatusDivider />
          <StatusItem icon={Star}>
            FASE <span className="text-[#FFD700]">{phase}</span>
          </StatusItem>
          <StatusDivider />
          <StatusItem icon={Coins}>
            <span className="text-[#FFD700]">{kz.toLocaleString("pt-AO")}</span> Kz
          </StatusItem>
          <StatusDivider />
          <StatusItem icon={Star}>
            <span className="text-[#FFD700]">{stars}</span> Estrelas
          </StatusItem>
        </div>

        {/* ── BOTÃO PRINCIPAL: JOGAR ── */}
        <button
          type="button"
          onClick={onPlay}
          className="group relative flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-[#1A2642] shadow-lg transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
          style={{
            background: "linear-gradient(180deg,#FFD700 0%,#FBC02D 100%)",
            boxShadow:
              "0 6px 16px rgba(255,193,7,0.45), 0 0 22px rgba(255,152,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          <Play className="h-6 w-6 fill-current" />
          <span className="text-xl font-extrabold uppercase tracking-wider drop-shadow-sm">
            Jogar
          </span>
          <Users className="h-6 w-6" />
          {/* Badge de notificação no canto superior direito do JOGAR. */}
          <NotifyBadge />
        </button>

        {/* ── BOTÕES SECUNDÁRIOS ── */}
        <nav className="flex flex-col gap-2">
          <MenuButton icon={Play} label="CONTINUAR" onClick={onContinue} />
          <MenuButton
            icon={ClipboardList}
            label="MISSÕES"
            onClick={onMissions}
            badge={hasUnclaimedMissions}
          />
          <MenuButton
            icon={ArrowUp}
            label="UPGRADES"
            onClick={onUpgrades}
            badge={hasAvailableUpgrades}
          />
          <MenuButton icon={User} label="PERSONAGEM" onClick={onCharacter} />
          <MenuButton icon={Settings} label="DEFINIÇÕES" onClick={onSettings} />
          <MenuButton icon={LogOut} label="SAIR DO JOGO" onClick={onExit} />
        </nav>

        {/* ── PAINEL INFERIOR: COMO JOGAR ── */}
        <footer className="mt-1 rounded-xl border border-[#4A6FA5]/50 bg-[#0F1C33]/80 p-2">
          <h2 className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
            Como Jogar
          </h2>
          <div className="flex items-stretch gap-1">
            <HowToColumn title="Navegação" icon={Hand} caption="Arrastar para mover" />
            <span className="w-px self-stretch bg-white/10" aria-hidden />
            <HowToColumn
              title="Como Jogar"
              icon={ZoomIn}
              caption="Pinchar zoom"
              highlight
            />
            <span className="w-px self-stretch bg-white/10" aria-hidden />
            <HowToColumn title="Interação" icon={MousePointerClick} caption="Toque chamar" />
          </div>
        </footer>
      </div>
    </div>
  );
}
