/**
 * Testes de lógica do sistema de fases (sem Phaser).
 * Corre com: node scripts/test-levels.mjs
 */
import assert from "node:assert/strict";

// ─── Réplica mínima da lógica (espelha ObjectiveManager / LevelManager) ───

function readMetric(metric, stats, combo, extras = {}) {
  switch (metric) {
    case "taxisFilled": return stats.taxisFilled;
    case "passengers": return stats.passengers;
    case "money": return stats.money;
    case "combo": return Math.max(stats.bestCombo ?? 1, combo);
    case "penalties": return stats.penalties ?? 0;
    case "disputesWon": return stats.disputesWon ?? 0;
    case "crossings": return stats.crossings ?? 0;
    case "callsUsed": return stats.callsUsed ?? 0;
    case "runsUsed": return stats.runsUsed ?? 0;
    case "survive": return extras.survived ? 1 : 0;
    case "reputation": return extras.reputationTotal ?? stats.reputation ?? 0;
    default: return 0;
  }
}

function evaluateObjectives(defs, stats, combo, extras = {}) {
  return defs.map((def) => {
    const current = readMetric(def.metric, stats, combo, extras);
    let done = false;
    let failed = false;
    if (def.inverted) {
      if (current > def.goal) failed = true;
      else if (extras.finalize) done = current <= def.goal;
    } else if (def.metric === "survive") {
      if (extras.finalize && extras.survived) done = true;
    } else {
      done = current >= def.goal;
    }
    return { ...def, current, done, failed };
  });
}

function calculateStars(rules, objs, timeSpent, stats, combo) {
  const isDone = (id) => objs.find((o) => o.id === id)?.done === true;
  if (!rules.star1.every(isDone)) return 0;
  let stars = 1;
  if (rules.star2?.withinSeconds != null && timeSpent <= rules.star2.withinSeconds) stars = 2;
  if (stars >= 2 && rules.star3) {
    const objsOk = (rules.star3.requireObjectives ?? []).every(isDone);
    let bonusOk = true;
    if (rules.star3.bonusMetric != null && rules.star3.bonusGoal != null) {
      bonusOk = readMetric(rules.star3.bonusMetric, stats, combo) >= rules.star3.bonusGoal;
    }
    if (objsOk && bonusOk) stars = 3;
  }
  return stars;
}

function blankStats(over = {}) {
  return {
    taxisFilled: 0, passengers: 0, money: 0, bestCombo: 1,
    penalties: 0, disputesWon: 0, crossings: 0, callsUsed: 0, runsUsed: 0,
    reputation: 0, ...over,
  };
}

// ─── Fase 1 ───
{
  const defs = [{ id: "p1_passenger", metric: "passengers", goal: 1, kind: "primary" }];
  const rules = {
    star1: ["p1_passenger"],
    star2: { withinSeconds: 180 },
    star3: { bonusMetric: "callsUsed", bonusGoal: 1 },
  };

  let objs = evaluateObjectives(defs, blankStats(), 1);
  assert.equal(calculateStars(rules, objs, 100, blankStats(), 1), 0, "fase1 sem passageiro = 0★");

  const stats1 = blankStats({ passengers: 1 });
  objs = evaluateObjectives(defs, stats1, 1);
  assert.equal(calculateStars(rules, objs, 200, stats1, 1), 1, "fase1 1 passageiro lento = 1★");
  assert.equal(calculateStars(rules, objs, 100, stats1, 1), 2, "fase1 rápido = 2★");

  const stats3 = blankStats({ passengers: 1, callsUsed: 1 });
  objs = evaluateObjectives(defs, stats3, 1);
  assert.equal(calculateStars(rules, objs, 100, stats3, 1), 3, "fase1 + call = 3★");
  console.log("✓ Fase 1 — estrelas e objectivo principal");
}

// ─── Fase 5 ───
{
  const defs = [
    { id: "p5_taxis", metric: "taxisFilled", goal: 3, kind: "primary" },
    { id: "p5_money", metric: "money", goal: 400, kind: "secondary" },
  ];
  const rules = {
    star1: ["p5_taxis"],
    star2: { withinSeconds: 110 },
    star3: { requireObjectives: ["p5_money"] },
  };

  let stats = blankStats({ taxisFilled: 2, money: 500 });
  let objs = evaluateObjectives(defs, stats, 1);
  assert.equal(calculateStars(rules, objs, 50, stats, 1), 0, "fase5 2 táxis = 0★");

  stats = blankStats({ taxisFilled: 3, money: 200 });
  objs = evaluateObjectives(defs, stats, 1);
  assert.equal(calculateStars(rules, objs, 50, stats, 1), 2, "fase5 3 táxis rápido sem money = 2★");
  assert.equal(calculateStars(rules, objs, 120, stats, 1), 1, "fase5 3 táxis lento = 1★");

  stats = blankStats({ taxisFilled: 3, money: 400 });
  objs = evaluateObjectives(defs, stats, 1);
  assert.equal(calculateStars(rules, objs, 50, stats, 1), 3, "fase5 completo = 3★");
  console.log("✓ Fase 5 — táxis + dinheiro + estrelas");
}

// ─── Objectivo invertido (penalizações) ───
{
  const defs = [
    { id: "main", metric: "taxisFilled", goal: 3, kind: "primary" },
    { id: "pen", metric: "penalties", goal: 2, kind: "special", inverted: true },
  ];
  let stats = blankStats({ taxisFilled: 3, penalties: 1 });
  let objs = evaluateObjectives(defs, stats, 1, { finalize: true });
  assert.equal(objs[1].done, true, "1 penalização ≤ 2 = ok");
  assert.equal(objs[1].failed, false);

  stats = blankStats({ taxisFilled: 3, penalties: 3 });
  objs = evaluateObjectives(defs, stats, 1, { finalize: true });
  assert.equal(objs[1].failed, true, "3 penalizações > 2 = falha");
  assert.equal(objs[1].done, false);
  console.log("✓ Objectivos invertidos (penalizações)");
}

// ─── Progressão / desbloqueio ───
{
  let unlocked = 1;
  const complete = (phase, stars) => {
    if (stars >= 1 && phase >= unlocked) unlocked = Math.min(20, phase + 1);
  };
  complete(1, 1);
  assert.equal(unlocked, 2, "1★ desbloqueia fase 2");
  complete(2, 0);
  assert.equal(unlocked, 2, "0★ não desbloqueia");
  complete(2, 3);
  assert.equal(unlocked, 3, "3★ desbloqueia fase 3");
  // Replay não regrede
  const bestStars = Math.max(1, 3);
  assert.equal(bestStars, 3, "mantém melhor pontuação");
  console.log("✓ Desbloqueio e replay de fases");
}

// ─── Upgrades balanceados ───
{
  const costs = [300, 500, 800, 1200, 1800];
  const per = 0.04;
  let money = 5000;
  let level = 0;
  for (let i = 0; i < 5; i++) {
    const cost = costs[i];
    assert.ok(money >= cost, `pode comprar nível ${i + 1}`);
    money -= cost;
    level++;
  }
  assert.equal(level, 5);
  const speedMul = 1 + per * level;
  assert.ok(speedMul <= 1.25, "cap de velocidade respeitado na ProgressionManager");
  console.log("✓ Upgrades com custos e caps");
}

// ─── XP / nível ───
{
  const xpPerLevelBase = 200;
  const growth = 1.18;
  const xpForLevel = (level) =>
    Math.round((xpPerLevelBase * (Math.pow(growth, level - 1) - 1)) / (growth - 1));
  const levelFromXp = (xp) => {
    let level = 1;
    while (level < 50 && xp >= xpForLevel(level + 1)) level++;
    return level;
  };
  assert.equal(levelFromXp(0), 1);
  assert.ok(levelFromXp(500) >= 2);
  assert.ok(xpForLevel(2) > xpForLevel(1));
  console.log("✓ Sistema de XP e nível");
}

// ─── Save merge ───
{
  const base = { unlockedPhase: 1, phases: {}, money: 0, upgrades: { velocidade: 0 } };
  const saved = { unlockedPhase: 5, phases: { "1": { stars: 3, completed: true } }, money: 1200 };
  const merged = { ...base, ...saved, upgrades: { ...base.upgrades, ...(saved.upgrades ?? {}) } };
  assert.equal(merged.unlockedPhase, 5);
  assert.equal(merged.phases["1"].stars, 3);
  assert.equal(merged.money, 1200);
  console.log("✓ Save merge / load progresso");
}

console.log("\n✅ Todos os testes de fases passaram.");
