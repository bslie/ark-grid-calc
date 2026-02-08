import type { Core, Astrogem, SolverResult } from "./types";
import {
  CORE_CONFIG,
  BREAKPOINT_WEIGHTS,
  SUN_MOON_DESTINY_BONUS,
  ANCIENT_17P_BONUS,
} from "./types";
import { getCoreCategory } from "./helpers";
import {
  calculateTotalWillpower,
  calculateTotalPoints,
  getBreakpointsHit,
  calculateScore,
} from "./helpers";
import { generateId } from "./helpers";

function isOrderSunCore(core: Core): boolean {
  return core.type === "Order of the Sun";
}

function isOrderMoonCore(core: Core): boolean {
  return core.type === "Order of the Moon";
}

function expandAstrogems(astrogems: Astrogem[]): Astrogem[] {
  return astrogems;
}

function findValidCombinations(
  core: Core,
  availableAstrogems: Astrogem[],
  maxAstrogems = 4
): Astrogem[][] {
  const coreCategory = getCoreCategory(core.type);
  const maxWillpower = CORE_CONFIG[core.rarity].maxWillpower;
  const compatibleGems = availableAstrogems.filter(
    (gem) => gem.category === coreCategory
  );

  const validCombinations: Astrogem[][] = [];

  function generateCombinations(
    startIndex: number,
    currentCombo: Astrogem[],
    currentWillpower: number
  ) {
    if (currentCombo.length > 0) {
      validCombinations.push([...currentCombo]);
    }

    if (currentCombo.length >= maxAstrogems) return;

    for (let i = startIndex; i < compatibleGems.length; i++) {
      const gem = compatibleGems[i]!;
      const wp = gem.willpower ?? 0;
      const newWillpower = currentWillpower + wp;
      if (newWillpower > maxWillpower) continue;

      currentCombo.push(gem);
      generateCombinations(i + 1, currentCombo, newWillpower);
      currentCombo.pop();
    }
  }

  generateCombinations(0, [], 0);
  
  // Сортируем комбинации: сначала с большим количеством очков, пустую - в конец
  validCombinations.sort((a, b) => {
    const pointsA = a.reduce((sum, g) => sum + (g.points ?? 0), 0);
    const pointsB = b.reduce((sum, g) => sum + (g.points ?? 0), 0);
    return pointsB - pointsA;
  });
  
  // Добавляем пустую комбинацию только в самый конец (как последний вариант)
  validCombinations.push([]);

  return validCombinations;
}

function solveCategoryOptimal(
  cores: Core[],
  astrogems: Astrogem[]
): SolverResult[] {
  if (cores.length === 0) return [];

  const bestAssignment = new Map<string, Astrogem[]>();
  let bestTotalScore = -1;

  // Слабым ядрам (Legendary, Epic) даём приоритет при выборе рун,
  // чтобы они могли достичь 10p, а не отдавать все лучшие руны Relic/Ancient
  const rarityOrder: Record<string, number> = {
    Epic: 0,
    Legendary: 1,
    Relic: 2,
    Ancient: 3,
  };
  const sortedCores = [...cores].sort(
    (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]
  );

  const hasOrderSunCore = cores.some((c) => isOrderSunCore(c));
  const hasOrderMoonCore = cores.some((c) => isOrderMoonCore(c));
  const canGetDestinyBonus = hasOrderSunCore && hasOrderMoonCore;
  const destinyBonusValue = canGetDestinyBonus ? SUN_MOON_DESTINY_BONUS : 0;

  const maxRemainingScores = new Array(sortedCores.length + 1).fill(0);
  for (let i = sortedCores.length - 1; i >= 0; i--) {
    const core = sortedCores[i]!;
    const breakpoints = CORE_CONFIG[core.rarity].breakpoints;
    const coreMaxScore = breakpoints.reduce(
      (s, bp) => s + (BREAKPOINT_WEIGHTS[bp] ?? 0),
      0
    );
    maxRemainingScores[i] = maxRemainingScores[i + 1]! + coreMaxScore;
  }

  const gemIndexMap = new Map<string, number>();
  astrogems.forEach((gem, idx) => gemIndexMap.set(gem.id, idx));

  type ComboEntry = {
    gems: Astrogem[];
    gemIndices: number[];
    score: number;
    points: number;
  };

  const allCoreCombos: ComboEntry[][] = [];
  for (const core of sortedCores) {
    const combos = findValidCombinations(core, astrogems);
    const scoredCombos: ComboEntry[] = combos.map((gems) => {
      const points = calculateTotalPoints(gems);
      const score = calculateScore(points, core.rarity);
      const gemIndices = gems.map((g) => gemIndexMap.get(g.id) ?? -1);
      return { gems, gemIndices, score, points };
    });
    scoredCombos.sort((a, b) => b.score - a.score);
    allCoreCombos.push(scoredCombos);
  }

  const usedGems = new Array(astrogems.length).fill(false) as boolean[];
  const currentAssignment: (Astrogem[] | null)[] = new Array(
    sortedCores.length
  ).fill(null);

  const search = (coreIndex: number, currentScore: number, coresWithGems: number) => {
    if (coreIndex === sortedCores.length) {
      let totalScore = currentScore;
      if (canGetDestinyBonus) {
        const sunCoreIdx = sortedCores.findIndex((c) => isOrderSunCore(c));
        const moonCoreIdx = sortedCores.findIndex((c) => isOrderMoonCore(c));
        if (sunCoreIdx !== -1 && moonCoreIdx !== -1) {
          const sunGems = currentAssignment[sunCoreIdx] ?? [];
          const moonGems = currentAssignment[moonCoreIdx] ?? [];
          const sunPoints = calculateTotalPoints(sunGems);
          const moonPoints = calculateTotalPoints(moonGems);
          if (sunPoints >= 14 && moonPoints >= 14) {
            totalScore += SUN_MOON_DESTINY_BONUS;
          }
        }
      }
      
      // Приоритизируем решения, где больше ядер имеют руниты
      const coverageBonus = coresWithGems * 0.1;
      totalScore += coverageBonus;

      // Штраф за ядра с рунитами, но без 10p — приоритет: каждое ядро должно достичь 10p
      const below10Penalty = 5;
      for (let idx = 0; idx < sortedCores.length; idx++) {
        const gems = currentAssignment[idx] ?? [];
        const pts = calculateTotalPoints(gems);
        if (gems.length > 0 && pts > 0 && pts < 10) {
          totalScore -= below10Penalty;
        }
      }

      if (totalScore > bestTotalScore) {
        bestTotalScore = totalScore;
        bestAssignment.clear();
        sortedCores.forEach((core, idx) => {
          bestAssignment.set(core.id, currentAssignment[idx] ?? []);
        });
      }
      return;
    }

    if (
      currentScore +
        maxRemainingScores[coreIndex]! +
        destinyBonusValue <=
      bestTotalScore
    ) {
      return;
    }

    const combos = allCoreCombos[coreIndex]!;

    for (const combo of combos) {
      let hasConflict = false;
      for (const idx of combo.gemIndices) {
        if (usedGems[idx]) {
          hasConflict = true;
          break;
        }
      }
      if (hasConflict) continue;

      for (const idx of combo.gemIndices) {
        usedGems[idx] = true;
      }
      currentAssignment[coreIndex] = combo.gems;
      
      const hasGems = combo.gems.length > 0 ? 1 : 0;

      search(coreIndex + 1, currentScore + combo.score, coresWithGems + hasGems);

      for (const idx of combo.gemIndices) {
        usedGems[idx] = false;
      }
      currentAssignment[coreIndex] = null;
    }
  };

  search(0, 0, 0);

  const results: SolverResult[] = [];
  for (const core of cores) {
    const assignedGems = bestAssignment.get(core.id) ?? [];
    const totalPoints = calculateTotalPoints(assignedGems);
    const totalWillpower = calculateTotalWillpower(assignedGems);
    const breakpointsHit = getBreakpointsHit(totalPoints, core.rarity);
    const score = calculateScore(totalPoints, core.rarity);

    results.push({
      coreId: core.id,
      astrogems: assignedGems,
      totalPoints,
      totalWillpower,
      breakpointsHit,
      score,
    });
  }

  return results;
}

export function solveArkGrid(cores: Core[], allAstrogems: Astrogem[]): SolverResult[] {
  if (cores.length === 0) return [];

  const expandedAstrogems = expandAstrogems(allAstrogems);

  const orderAstrogems = expandedAstrogems.filter((gem) => gem.category === "Order");
  const chaosAstrogems = expandedAstrogems.filter((gem) => gem.category === "Chaos");
  const orderCores = cores.filter((c) => getCoreCategory(c.type) === "Order");
  const chaosCores = cores.filter((c) => getCoreCategory(c.type) === "Chaos");

  const orderResults = solveCategoryOptimal(orderCores, orderAstrogems);
  const chaosResults = solveCategoryOptimal(chaosCores, chaosAstrogems);

  const resultsMap = new Map<string, SolverResult>();
  for (const result of [...orderResults, ...chaosResults]) {
    resultsMap.set(result.coreId, result);
  }

  return cores
    .map((core) => resultsMap.get(core.id))
    .filter((r): r is SolverResult => Boolean(r));
}

export function getMaxPossibleScore(cores: Core[]): number {
  let baseScore = cores.reduce((total, core) => {
    const breakpoints = CORE_CONFIG[core.rarity].breakpoints;
    return (
      total +
      breakpoints.reduce((sum, bp) => sum + (BREAKPOINT_WEIGHTS[bp] ?? 0), 0)
    );
  }, 0);

  const orderCores = cores.filter((c) => getCoreCategory(c.type) === "Order");
  if (
    orderCores.some((c) => isOrderSunCore(c)) &&
    orderCores.some((c) => isOrderMoonCore(c))
  ) {
    baseScore += SUN_MOON_DESTINY_BONUS;
  }

  return baseScore;
}

export function getDestinyBonus(
  cores: Core[],
  results: SolverResult[]
): number {
  const orderSunCore = cores.find((c) => isOrderSunCore(c));
  const orderMoonCore = cores.find((c) => isOrderMoonCore(c));

  if (!orderSunCore || !orderMoonCore) return 0;

  const sunResult = results.find((r) => r.coreId === orderSunCore.id);
  const moonResult = results.find((r) => r.coreId === orderMoonCore.id);

  if (!sunResult || !moonResult) return 0;

  if (sunResult.totalPoints >= 14 && moonResult.totalPoints >= 14) {
    return SUN_MOON_DESTINY_BONUS;
  }

  return 0;
}
