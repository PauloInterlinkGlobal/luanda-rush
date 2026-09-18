import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CarFront,
  Check,
  ChevronRight,
  Clock3,
  Coins,
  Flag,
  Gauge,
  LockKeyhole,
  MapPin,
  Medal,
  Minus,
  Play,
  Trophy,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

type ObjectiveType = "PASSENGERS_DELIVERED" | "SPECIFIC_DESTINATION" | "MONEY_EARNED" | "FULL_CAPACITY_TRIPS" | "BEAT_RIVAL" | "NO_COLLISIONS";
type LevelObjective = { type: ObjectiveType; target_value: number; current_value: number; completed: boolean; description: string };
type LevelData = { level_number: number; chapter_name: string; objectives: LevelObjective[]; time_limit_seconds: number; rival_count: number; reward_kz: number; unlocked: boolean; stars: number };

const levels: LevelData[] = [
  { level_number: 1, chapter_name: "Cazenga", objectives: [{ type: "PASSENGERS_DELIVERED", target_value: 5, current_value: 3, completed: false, description: "Leva passageiros" }], time_limit_seconds: 150, rival_count: 0, reward_kz: 250, unlocked: true, stars: 3 },
  { level_number: 2, chapter_name: "Cazenga", objectives: [{ type: "MONEY_EARNED", target_value: 100, current_value: 100, completed: true, description: "Ganha Kz" }], time_limit_seconds: 140, rival_count: 0, reward_kz: 300, unlocked: true, stars: 2 },
  { level_number: 5, chapter_name: "Viana", objectives: [{ type: "PASSENGERS_DELIVERED", target_value: 8, current_value: 5, completed: false, description: "Leva passageiros" }, { type: "SPECIFIC_DESTINATION", target_value: 3, current_value: 1, completed: false, description: "Chega a Viana" }], time_limit_seconds: 125, rival_count: 0, reward_kz: 480, unlocked: true, stars: 1 },
  { level_number: 10, chapter_name: "Talatona", objectives: [{ type: "FULL_CAPACITY_TRIPS", target_value: 3, current_value: 2, completed: false, description: "Viagens cheias" }, { type: "MONEY_EARNED", target_value: 100, current_value: 72, completed: false, description: "Ganha Kz" }, { type: "BEAT_RIVAL", target_value: 1, current_value: 0, completed: false, description: "Vence o rival" }], time_limit_seconds: 105, rival_count: 1, reward_kz: 700, unlocked: true, stars: 0 },
  { level_number: 14, chapter_name: "Maianga", objectives: [{ type: "PASSENGERS_DELIVERED", target_value: 12, current_value: 12, completed: true, description: "Leva passageiros" }, { type: "NO_COLLISIONS", target_value: 1, current_value: 1, completed: true, description: "Sem colisões" }, { type: "MONEY_EARNED", target_value: 180, current_value: 120, completed: false, description: "Ganha Kz" }], time_limit_seconds: 95, rival_count: 2, reward_kz: 950, unlocked: false, stars: 0 },
  { level_number: 18, chapter_name: "Centro", objectives: [{ type: "PASSENGERS_DELIVERED", target_value: 15, current_value: 9, completed: false, description: "Leva passageiros" }, { type: "MONEY_EARNED", target_value: 250, current_value: 155, completed: false, description: "Ganha Kz" }, { type: "FULL_CAPACITY_TRIPS", target_value: 4, current_value: 2, completed: false, description: "Viagens cheias" }, { type: "BEAT_RIVAL", target_value: 3, current_value: 1, completed: false, description: "Vence os rivais" }], time_limit_seconds: 78, rival_count: 3, reward_kz: 1400, unlocked: false, stars: 0 },
];

const chapters = ["Cazenga", "Viana", "Talatona", "Maianga", "Rangel", "Centro"];
const objectiveIcons: Record<ObjectiveType, typeof UserRound> = { PASSENGERS_DELIVERED: UserRound, SPECIFIC_DESTINATION: MapPin, MONEY_EARNED: Coins, FULL_CAPACITY_TRIPS: CarFront, BEAT_RIVAL: Trophy, NO_COLLISIONS: Zap };

function Stars({ count }: { count: number }) { return <span className="stars" aria-label={`${count} de 3 estrelas`}>{[1, 2, 3].map((n) => <span key={n} className={n <= count ? "star filled" : "star"}>★</span>)}</span>; }
function ProgressObjective({ objective, compact = false }: { objective: LevelObjective; compact?: boolean }) { const Icon = objectiveIcons[objective.type]; const percent = Math.min(100, Math.round((objective.current_value / objective.target_value) * 100)); return <div className={`objective ${objective.completed ? "completed" : ""} ${compact ? "compact" : ""}`}><div className="objective-top"><Icon size={compact ? 13 : 16} strokeWidth={2.5} /><span>{compact ? `${objective.current_value}/${objective.target_value}` : `${objective.description} ${objective.current_value}/${objective.target_value}`}</span>{objective.completed && <Check size={14} />}</div>{!compact && <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>}</div>; }

export default function LotadorScreens() {
  const [screen, setScreen] = useState<"levels" | "hud">("levels");
  const [selected, setSelected] = useState(0);
  const [chapter, setChapter] = useState("Cazenga");
  const visibleLevels = useMemo(() => levels.filter((level) => level.chapter_name === chapter), [chapter]);
  const active = levels[selected] ?? levels[0];
  const hudLevel = levels[5];
  return <div className="lotador-shell">
    <div className="pixel-sky" />
    <header className="lotador-header"><div className="brand-lockup"><span className="brand-mark">L</span><div><strong>LOTADOR</strong><small>CHAMA · LOTA · GANHA</small></div></div><div className="header-stats"><span><Coins size={15} /> 2.480 Kz</span><span><Medal size={15} /> Nível 7</span></div></header>
    <div className="street-lines" />
    {screen === "levels" ? <main className="level-screen"><div className="screen-heading"><div><p className="eyebrow">MAPA DE OPERAÇÃO</p><h1>Escolhe a tua paragem</h1><p className="muted">Avança pelos bairros de Luanda e prova que és o melhor lotador.</p></div><button className="hud-link" onClick={() => setScreen("hud")}><Gauge size={17} /> Ver HUD de jogo <ChevronRight size={16} /></button></div>
      <nav className="chapter-tabs" aria-label="Capítulos">{chapters.map((name, i) => <button key={name} className={chapter === name ? "active" : ""} onClick={() => setChapter(name)}><span>{String(i + 1).padStart(2, "0")}</span>{name}</button>)}</nav>
      <section className="level-layout"><div className="map-panel"><div className="map-grid" />{visibleLevels.length ? visibleLevels.map((level, i) => <button key={level.level_number} className={`map-node ${level.unlocked ? "unlocked" : "locked"} ${levels.indexOf(level) === selected ? "selected" : ""}`} style={{ left: `${24 + (i % 2) * 40}%`, top: `${22 + i * 22}%` }} onClick={() => level.unlocked && setSelected(levels.indexOf(level))}><span className="node-number">{level.unlocked ? level.level_number : <LockKeyhole size={17} />}</span><span className="node-label">{level.chapter_name} {level.level_number}</span></button>) : <div className="empty-chapter">Paragens a caminho...</div>}<div className="map-sign"><MapPin size={18} /> {chapter.toUpperCase()}<small>Rota em progresso</small></div></div>
        <aside className="level-detail"><div className="detail-kicker"><span>FASE {String(active.level_number).padStart(2, "0")}</span><span className={active.unlocked ? "status-open" : "status-locked"}>{active.unlocked ? "DISPONÍVEL" : "BLOQUEADA"}</span></div><h2>{active.chapter_name}</h2><p className="route-name">Rota {active.level_number < 10 ? "de entrada" : "do movimento"}</p><div className="detail-rule" /><div className="detail-meta"><span><Clock3 size={16} /> {active.time_limit_seconds}s</span><span><CarFront size={16} /> {active.rival_count} {active.rival_count === 1 ? "rival" : "rivais"}</span><span><Coins size={16} /> +{active.reward_kz} Kz</span></div><h3>Objetivos da corrida</h3><div className="detail-objectives">{active.objectives.map((objective, i) => <ProgressObjective key={i} objective={objective} />)}</div><button className="play-button" disabled={!active.unlocked} onClick={() => setScreen("hud")}><Play size={18} fill="currentColor" /> {active.unlocked ? "JOGAR FASE" : "FASE BLOQUEADA"}</button><p className="best-score"><Trophy size={14} /> Melhor resultado <Stars count={active.stars} /></p></aside></section>
    </main> : <main className="game-screen"><div className="game-topbar"><button className="back-button" onClick={() => setScreen("levels")}><ArrowLeft size={17} /> Fases</button><div className="hud-title"><span>FASE 18</span><strong>CENTRO</strong></div><div className="timer urgent"><Clock3 size={16} /> 01:18</div></div><div className="game-world"><div className="road road-one" /><div className="road road-two" /><div className="crosswalk" /><div className="bus-stop"><span>PARAGEM</span><i /></div><div className="taxi taxi-player"><CarFront size={42} /></div><div className="passenger p1"><UserRound size={30} /><b>APRESSADO</b></div><div className="passenger p2"><UserRound size={30} /><b>RANGEL</b></div><div className="rival-car"><CarFront size={34} /></div><div className="hud-card objectives-hud"><div className="hud-card-heading"><span>OBJETIVOS</span><small>4 ATIVOS</small></div>{hudLevel.objectives.map((objective, i) => <ProgressObjective key={i} objective={objective} />)}</div><div className="corner-hud left"><span><Zap size={14} /> DELI</span><div className="energy"><i /><i /><i /><i /><i /></div></div><div className="corner-hud right"><span><Coins size={16} /> 2.480 Kz</span></div></div></main>}
    <footer className="screen-footer"><span>LUANDA, ANGOLA</span><span>•</span><span>OPERAÇÃO #00{active.level_number}</span></footer>
  </div>;
}
export { levels };
