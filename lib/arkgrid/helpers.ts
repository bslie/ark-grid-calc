import type {
  Core,
  CoreType,
  CoreRarity,
  Astrogem,
  AstrogemCategory,
} from "./types";
import {
  CORE_CONFIG,
  CORE_CATEGORIES,
  BREAKPOINT_WEIGHTS,
  ANCIENT_17P_BONUS,
} from "./types";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createEmptyCore(
  type: CoreType,
  rarity: CoreRarity = "Relic"
): Core {
  return {
    id: generateId(),
    name: type,
    type,
    rarity,
    astrogems: [],
  };
}

export function createEmptyAstrogem(
  category: AstrogemCategory
): Astrogem {
  return {
    id: generateId(),
    name: "",
    category,
    willpower: null,
    points: null,
  };
}

export function getCoreCategory(type: CoreType): AstrogemCategory {
  return CORE_CATEGORIES[type];
}

export function getMaxWillpower(rarity: CoreRarity): number {
  return CORE_CONFIG[rarity].maxWillpower;
}

export function getBreakpoints(rarity: CoreRarity): number[] {
  return CORE_CONFIG[rarity].breakpoints;
}

export function calculateTotalWillpower(astrogems: Astrogem[]): number {
  return astrogems.reduce((sum, gem) => sum + (gem.willpower ?? 0), 0);
}

export function calculateTotalPoints(astrogems: Astrogem[]): number {
  return astrogems.reduce((sum, gem) => sum + (gem.points ?? 0), 0);
}

export function getBreakpointsHit(
  points: number,
  rarity: CoreRarity
): number[] {
  const breakpoints = getBreakpoints(rarity);
  return breakpoints.filter((bp) => points >= bp);
}

export function calculateScore(points: number, rarity: CoreRarity): number {
  const breakpointsHit = getBreakpointsHit(points, rarity);
  return breakpointsHit.reduce((score, bp) => {
    let weight = BREAKPOINT_WEIGHTS[bp] ?? 0;
    if (bp === 17 && rarity === "Ancient") {
      weight += ANCIENT_17P_BONUS;
    }
    return score + weight;
  }, 0);
}
