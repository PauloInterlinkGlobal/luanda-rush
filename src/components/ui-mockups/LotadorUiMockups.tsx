/**
 * O LOTADOR — Mockups de UI (React)
 * 1) Ecrã de selecção de fases por capítulo/bairro
 * 2) HUD de objectivos durante o jogo (1–4 objectivos)
 *
 * Landscape-first · paleta do jogo · dados de exemplo embutidos.
 */
import { useMemo, useState, useCallback, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import "./LotadorUiMockups.css";
import {
  CHAPTERS,
  SAMPLE_LEVELS,
  OBJECTIVE_META,
  HUD_DEMO_TUTORIAL,
  HUD_DEMO_MID,
  HUD_DEMO_ADVANCED,
  formatObjectiveLine,
  objectiveProgress,
  formatTime,
  type LevelData,
  type LevelObjective,
  type ObjectiveType,
} from "./lotadorUiData";

type Screen = "levels" | "hud";
type HudPreset = "tutorial" | "mid" | "advanced";

function Stars({ count, small }: { count: number; small?: boolean }) {
  return (
    <span className="lm-stars" aria-label={`${count} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`lm-star${small ? " small" : ""}${i < count ? " filled" : ""}`}
        />
      ))}
    </span>
  );
}

function ObjIcon({ type }: { type: ObjectiveType }) {
  const meta = OBJECTIVE_META[type];
  return (
    <span className={`lm-obj-icon ${meta.css}`} title={meta.label} aria-hidden>
      {meta.icon}
    </span>
  );
}

function DensityDots({ n }: { n: number }) {
  return (
    <span className="density-dots" aria-hidden>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <span key={i} className={i <= n ? "on" : undefined} />
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEVEL SELECT
   ═══════════════════════════════════════════════════════════ */

function LevelSelectScreen({
  levels,
  selectedId,
  onSelect,
  onPlay,
}: {
  levels: LevelData[];
  selectedId: number;
  onSelect: (n: number) => void;
  onPlay: (level: LevelData) => void;
}) {
  const selected = levels.find((l) => l.level_number === selectedId) ?? levels[0]!;
  const [chapterId, setChapterId] = useState(selected.chapter_id);

  const chapterLevels = useMemo(
    () => levels.filter((l) => l.chapter_id === chapterId),
    [levels, chapterId],
  );

  const selectChapter = (id: string) => {
    setChapterId(id);
    const first = levels.find((l) => l.chapter_id === id);
    if (first) onSelect(first.level_number);
  };

  const unlockedChapters = useMemo(() => {
    const set = new Set<string>();
    for (const l of levels) if (l.unlocked) set.add(l.chapter_id);
    // first chapter always "open" visually if any level unlocked there
    if (levels.some((l) => l.unlocked)) set.add(CHAPTERS[0]!.id);
    return set;
  }, [levels]);

  const totalStars = levels.reduce((s, l) => s + l.stars, 0);
  const maxStars = levels.length * 3;
  const completedCount = levels.filter((l) => l.completed || l.stars > 0).length;

  const chapter = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0]!;

  return (
    <div className="lm-screen lm-levels active" role="region" aria-label="Selecção de fases">
      <header className="lm-levels-header">
        <Link to="/" className="back-btn" title="Voltar ao jogo" aria-label="Voltar">
          ←
        </Link>
        <div className="titles">
          <h1 className="lm-pixel-title">O LOTADOR</h1>
          <div className="tagline">Corre · Chama · Lota · Ganha</div>
        </div>
        <div className="progress-chip lm-card">
          <span>
            ★ {totalStars}/{maxStars}
          </span>
          <div className="bar" aria-hidden>
            <i style={{ width: `${(totalStars / Math.max(1, maxStars)) * 100}%` }} />
          </div>
          <span style={{ color: "var(--muted)", fontSize: 11 }}>
            {completedCount}/{levels.length}
          </span>
        </div>
      </header>

      <nav className="lm-chapter-tabs" aria-label="Capítulos">
        {CHAPTERS.map((ch) => {
          const open = unlockedChapters.has(ch.id);
          return (
            <button
              key={ch.id}
              type="button"
              className={`lm-chapter-tab${chapterId === ch.id ? " active" : ""}${
                open ? "" : " locked"
              }`}
              onClick={() => selectChapter(ch.id)}
            >
              {!open && <span className="lock">🔒</span>}
              {ch.name}
              <DensityDots n={ch.density} />
            </button>
          );
        })}
      </nav>

      <div className="lm-levels-body">
        <div className="lm-level-grid" role="list">
          {chapterLevels.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: 12 }}>
              Sem fases neste capítulo (dados de exemplo).
            </div>
          )}
          {chapterLevels.map((lv) => {
            const locked = !lv.unlocked;
            const selectedCard = lv.level_number === selected.level_number;
            return (
              <button
                key={lv.level_number}
                type="button"
                role="listitem"
                className={`lm-level-card${locked ? " locked" : ""}${
                  selectedCard ? " selected" : ""
                }${lv.completed || lv.stars > 0 ? " completed" : ""}`}
                onClick={() => {
                  if (!locked) onSelect(lv.level_number);
                  else onSelect(lv.level_number); // still show detail as locked
                }}
                aria-pressed={selectedCard}
                aria-disabled={locked}
              >
                <div className="num">FASE {lv.level_number}</div>
                <div className="name">{lv.name}</div>
                <div className="obj-row" aria-label="Objectivos">
                  {lv.objectives.map((o, i) => (
                    <ObjIcon key={`${o.type}-${i}`} type={o.type} />
                  ))}
                </div>
                <div className="meta-row">
                  <Stars count={lv.stars} small />
                  {lv.rival_count > 0 && (
                    <span className="rival-badge" title="Rivais">
                      🏃×{lv.rival_count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <aside className="lm-level-detail lm-card" aria-live="polite">
          <div className="detail-top">
            <div>
              <div className="detail-phase">FASE {selected.level_number}</div>
              <h2>{selected.name}</h2>
            </div>
            <span className="chapter-pill">{selected.chapter_name}</span>
          </div>

          <div style={{ marginTop: 2 }}>
            <Stars count={selected.stars} />
          </div>

          <div className="stats-row">
            <div className="stat">
              ⏱ Tempo
              <b className={selected.time_limit_seconds <= 110 ? "red" : undefined}>
                {formatTime(selected.time_limit_seconds)}
              </b>
            </div>
            <div className="stat">
              💰 Recompensa
              <b className="gold">{selected.reward_kz.toLocaleString("pt-AO")} Kz</b>
            </div>
            <div className="stat">
              🏃 Rivais
              <b>{selected.rival_count}</b>
            </div>
          </div>

          <div className="lm-detail-objectives">
            <div className="label">OBJECTIVOS · {chapter.tagline}</div>
            {selected.objectives.map((o, i) => (
              <div
                key={`${o.type}-${i}`}
                className={`lm-detail-obj${o.completed ? " completed" : ""}`}
              >
                <ObjIcon type={o.type} />
                <span className="desc">{o.description}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--muted)" }}>
                  {o.type === "BEAT_RIVAL" || o.type === "NO_COLLISIONS"
                    ? o.completed
                      ? "✓"
                      : `0/${o.target_value}`
                    : `${o.current_value}/${o.target_value}`}
                </span>
              </div>
            ))}
          </div>

          {selected.unlocked ? (
            <button
              type="button"
              className="lm-btn lm-btn-primary lm-play-btn"
              onClick={() => onPlay(selected)}
            >
              ▶ JOGAR
            </button>
          ) : (
            <div className="lm-locked-hint">
              🔒 Completa a fase anterior com pelo menos 1★ para desbloquear.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HUD OBJECTIVES
   ═══════════════════════════════════════════════════════════ */

function ObjectiveBar({ objective }: { objective: LevelObjective }) {
  const pct = Math.round(objectiveProgress(objective) * 100);
  const line = formatObjectiveLine(objective);
  const countLabel =
    objective.type === "BEAT_RIVAL"
      ? objective.completed
        ? "✓"
        : `${objective.current_value}/${objective.target_value}`
      : objective.type === "NO_COLLISIONS"
        ? `${objective.current_value}/${objective.target_value}`
        : `${objective.current_value}/${objective.target_value}`;

  return (
    <div
      className={`lm-obj-bar${objective.completed ? " completed" : ""}`}
      role="status"
      aria-label={line}
    >
      <ObjIcon type={objective.type} />
      <span className="text">{line}</span>
      <div className="track" aria-hidden>
        <i style={{ width: `${pct}%` } as CSSProperties} />
      </div>
      <span className="count">{countLabel}</span>
    </div>
  );
}

function ObjectivesHud({
  phaseLabel,
  objectives,
}: {
  phaseLabel: string;
  objectives: LevelObjective[];
}) {
  const count = Math.min(4, Math.max(1, objectives.length));
  return (
    <div
      className={`lm-objectives-hud count-${count}`}
      role="region"
      aria-label="Objectivos da fase"
    >
      <div className="phase-label">{phaseLabel}</div>
      <div className="lm-obj-list">
        {objectives.slice(0, 4).map((o, i) => (
          <ObjectiveBar key={`${o.type}-${i}`} objective={o} />
        ))}
      </div>
    </div>
  );
}

function HudScreen({
  preset,
  onPreset,
  objectives,
  onSimulateComplete,
  phaseLabel,
  money,
  timeLeft,
}: {
  preset: HudPreset;
  onPreset: (p: HudPreset) => void;
  objectives: LevelObjective[];
  onSimulateComplete: () => void;
  phaseLabel: string;
  money: number;
  timeLeft: number;
}) {
  return (
    <div className="lm-screen lm-hud-screen active" role="region" aria-label="HUD de objectivos">
      <div className="world-deco" aria-hidden>
        <div className="bus-stop" />
        <div className="crosswalk" />
        <div className="nelo" />
        <div className="floating-tag red">Apressado</div>
        <div className="floating-tag green">CENTRO</div>
      </div>

      {/* Existing corner HUDs */}
      <div className="lm-corner-hud left">
        <div className="lm-chip">
          ⚡
          <div className="energy-bar">
            <i />
          </div>
          72%
        </div>
        <div className="lm-chip">🎯 OBJ.</div>
      </div>
      <div className="lm-corner-hud right">
        <div className="lm-chip gold">💰 {money.toLocaleString("pt-AO")} Kz</div>
        <div className={`lm-chip timer${timeLeft <= 30 ? " warn" : ""}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* NEW: objectives HUD top-center */}
      <ObjectivesHud phaseLabel={phaseLabel} objectives={objectives} />

      {/* Fake touch controls */}
      <div className="lm-touch-zone left" aria-hidden>
        <div className="lm-stick" />
      </div>
      <div className="lm-touch-zone right" aria-hidden>
        <div className="lm-action-btn">
          🚕
          <span>CHAMAR</span>
        </div>
        <div className="lm-action-btn secondary">🏃</div>
      </div>

      {/* Demo switcher */}
      <div className="lm-hud-demo-bar" role="toolbar" aria-label="Demonstração HUD">
        <button
          type="button"
          className={preset === "tutorial" ? "active" : undefined}
          onClick={() => onPreset("tutorial")}
        >
          1 OBJ · Tutorial
        </button>
        <button
          type="button"
          className={preset === "mid" ? "active" : undefined}
          onClick={() => onPreset("mid")}
        >
          2 OBJ · Fase 5
        </button>
        <button
          type="button"
          className={preset === "advanced" ? "active" : undefined}
          onClick={() => onPreset("advanced")}
        >
          4 OBJ · Fase 18
        </button>
        <button type="button" className="sim" onClick={onSimulateComplete}>
          ✓ Completar 1º
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════ */

function cloneObjectives(list: LevelObjective[]): LevelObjective[] {
  return list.map((o) => ({ ...o }));
}

export default function LotadorUiMockups() {
  const [screen, setScreen] = useState<Screen>("levels");
  const [selectedId, setSelectedId] = useState(5);
  const [hudPreset, setHudPreset] = useState<HudPreset>("advanced");
  const [hudObjectives, setHudObjectives] = useState<LevelObjective[]>(() =>
    cloneObjectives(HUD_DEMO_ADVANCED),
  );

  const applyPreset = useCallback((p: HudPreset) => {
    setHudPreset(p);
    if (p === "tutorial") setHudObjectives(cloneObjectives(HUD_DEMO_TUTORIAL));
    else if (p === "mid") setHudObjectives(cloneObjectives(HUD_DEMO_MID));
    else setHudObjectives(cloneObjectives(HUD_DEMO_ADVANCED));
  }, []);

  const simulateComplete = useCallback(() => {
    setHudObjectives((prev) => {
      const next = prev.map((o) => ({ ...o }));
      const firstOpen = next.find((o) => !o.completed);
      if (firstOpen) {
        firstOpen.completed = true;
        firstOpen.current_value = firstOpen.target_value;
      }
      return next;
    });
  }, []);

  const phaseLabel = useMemo(() => {
    if (hudPreset === "tutorial") return "FASE 1 · PRIMEIRO DIA";
    if (hudPreset === "mid") return "FASE 5 · PRIMEIRO TURNO";
    return "FASE 18 · REI DA VOZ";
  }, [hudPreset]);

  const money = useMemo(() => {
    const m = hudObjectives.find((o) => o.type === "MONEY_EARNED");
    return m?.current_value ?? (hudPreset === "tutorial" ? 0 : 320);
  }, [hudObjectives, hudPreset]);

  const timeLeft = hudPreset === "tutorial" ? 240 : hudPreset === "mid" ? 98 : 42;

  const handlePlay = (level: LevelData) => {
    // Jump to HUD demo matching density
    if (level.objectives.length <= 1) applyPreset("tutorial");
    else if (level.objectives.length <= 2) applyPreset("mid");
    else applyPreset("advanced");
    // Seed HUD with this level's objectives (in-progress snapshot)
    setHudObjectives(
      level.objectives.map((o) => ({
        ...o,
        // keep sample progress if any, else start mid for demo flair on locked high levels
        current_value: o.current_value,
        completed: o.completed,
      })),
    );
    setScreen("hud");
  };

  return (
    <div className="lotador-mock">
      <div className="lm-devbar">
        <div className="brand">
          O LOTADOR<span>UI Mockups</span>
        </div>
        <button
          type="button"
          className={`lm-tab${screen === "levels" ? " active" : ""}`}
          onClick={() => setScreen("levels")}
        >
          🗺️ FASES
        </button>
        <button
          type="button"
          className={`lm-tab${screen === "hud" ? " active" : ""}`}
          onClick={() => setScreen("hud")}
        >
          🎯 HUD OBJECTIVOS
        </button>
        <span className="hint">Landscape · pixel · dados de exemplo</span>
        <Link to="/" className="back-game">
          ← Jogo
        </Link>
      </div>

      {screen === "levels" ? (
        <LevelSelectScreen
          levels={SAMPLE_LEVELS}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onPlay={handlePlay}
        />
      ) : (
        <HudScreen
          preset={hudPreset}
          onPreset={applyPreset}
          objectives={hudObjectives}
          onSimulateComplete={simulateComplete}
          phaseLabel={phaseLabel}
          money={money}
          timeLeft={timeLeft}
        />
      )}
    </div>
  );
}
