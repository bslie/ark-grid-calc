/** Редкость ядра */
export type CoreRarity = "Epic" | "Legendary" | "Relic" | "Ancient";
/** Тип ядра (орден/хаос + солнце/луна/звезда) */
export type CoreType =
  | "Order of the Sun"
  | "Order of the Moon"
  | "Order of the Star"
  | "Chaos of the Sun"
  | "Chaos of the Moon"
  | "Chaos of the Star";
/** Категория рунитов: Порядок или Хаос */
export type AstrogemCategory = "Order" | "Chaos";

export interface Astrogem {
  id: string;
  name: string;
  category: AstrogemCategory;
  willpower: number | null;
  points: number | null;
}

export interface Core {
  id: string;
  name: string;
  type: CoreType;
  rarity: CoreRarity;
  astrogems: Astrogem[];
}

export interface SolverResult {
  coreId: string;
  astrogems: Astrogem[];
  totalPoints: number;
  totalWillpower: number;
  breakpointsHit: number[];
  score: number;
}

export const CORE_CONFIG: Record<
  CoreRarity,
  { maxWillpower: number; breakpoints: number[] }
> = {
  Epic: { maxWillpower: 9, breakpoints: [10] },
  Legendary: { maxWillpower: 12, breakpoints: [10, 14] },
  Relic: { maxWillpower: 15, breakpoints: [10, 14, 17, 18, 19, 20] },
  Ancient: { maxWillpower: 17, breakpoints: [10, 14, 17, 18, 19, 20] },
};

export const BREAKPOINT_WEIGHTS: Record<number, number> = {
  10: 1,
  14: 5,
  17: 5,
  18: 0.5,
  19: 0.5,
  20: 0.5,
};

export const ANCIENT_17P_BONUS = 1.5;
export const SUN_MOON_DESTINY_BONUS = 10;

export const CORE_CATEGORIES: Record<CoreType, AstrogemCategory> = {
  "Order of the Sun": "Order",
  "Order of the Moon": "Order",
  "Order of the Star": "Order",
  "Chaos of the Sun": "Chaos",
  "Chaos of the Moon": "Chaos",
  "Chaos of the Star": "Chaos",
};

/** Русские названия для UI */
export const CORE_TYPE_LABELS: Record<CoreType, string> = {
  "Order of the Sun": "Солнца Порядка",
  "Order of the Moon": "Луны порядка",
  "Order of the Star": "Звезда порядка",
  "Chaos of the Sun": "Солнца хаоса",
  "Chaos of the Moon": "Луны хаоса",
  "Chaos of the Star": "Звезды хаоса",
};

export const RARITY_LABELS: Record<CoreRarity, string> = {
  Epic: "Эпичский",
  Legendary: "Легендарный",
  Relic: "Реликвия",
  Ancient: "Древний",
};

export const CATEGORY_LABELS: Record<AstrogemCategory, string> = {
  Order: "Порядок",
  Chaos: "Хаос",
};
