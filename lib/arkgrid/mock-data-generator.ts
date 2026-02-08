import type { Astrogem, AstrogemCategory, Core, CoreType, CoreRarity } from "./types";
import { generateId } from "./helpers";

/**
 * Правила для генерации рунитов (астрогемов):
 * - Willpower: от 1 до 4
 * - Points: от 1 до 7
 * - Каждый рунит имеет категорию: Order или Chaos
 */

interface AstrogemGenerationOptions {
  category: AstrogemCategory;
  willpowerMin?: number;
  willpowerMax?: number;
  pointsMin?: number;
  pointsMax?: number;
}

const DEFAULT_WILLPOWER_MIN = 1;
const DEFAULT_WILLPOWER_MAX = 4;
const DEFAULT_POINTS_MIN = 1;
const DEFAULT_POINTS_MAX = 7;

/**
 * Генерирует случайный астрогем с заданными ограничениями
 */
export function generateRandomAstrogem(
  options: AstrogemGenerationOptions
): Astrogem {
  const {
    category,
    willpowerMin = DEFAULT_WILLPOWER_MIN,
    willpowerMax = DEFAULT_WILLPOWER_MAX,
    pointsMin = DEFAULT_POINTS_MIN,
    pointsMax = DEFAULT_POINTS_MAX,
  } = options;

  const willpower = Math.floor(Math.random() * (willpowerMax - willpowerMin + 1)) + willpowerMin;
  const points = Math.floor(Math.random() * (pointsMax - pointsMin + 1)) + pointsMin;

  const categoryLabel = category === "Order" ? "Порядок" : "Хаос";
  const name = `${categoryLabel} ${willpower}W ${points}P`;

  return {
    id: generateId(),
    name,
    category,
    willpower,
    points,
  };
}

/**
 * Генерирует N астрогемов заданной категории
 */
export function generateAstrogemPool(
  count: number,
  category: AstrogemCategory
): Astrogem[] {
  const pool: Astrogem[] = [];
  for (let i = 0; i < count; i++) {
    pool.push(generateRandomAstrogem({ category }));
  }
  return pool;
}

/**
 * Генерирует сбалансированный пул астрогемов (50% Order, 50% Chaos)
 */
export function generateBalancedAstrogemPool(totalCount: number): Astrogem[] {
  const orderCount = Math.floor(totalCount / 2);
  const chaosCount = totalCount - orderCount;

  return [
    ...generateAstrogemPool(orderCount, "Order"),
    ...generateAstrogemPool(chaosCount, "Chaos"),
  ];
}

/**
 * Генерирует набор специфичных астрогемов для ядра
 * (3-4 астрогема с соответствующей категорией)
 */
export function generateCoreSpecificAstrogems(
  coreType: CoreType,
  count: number
): Astrogem[] {
  const category: AstrogemCategory = coreType.includes("Order") ? "Order" : "Chaos";
  return generateAstrogemPool(count, category);
}

/**
 * Генерирует тестовое ядро с рунитами
 */
export function generateTestCore(
  type: CoreType,
  rarity: CoreRarity,
  astrogemCount: number = 0
): Core {
  const core: Core = {
    id: generateId(),
    name: type,
    type,
    rarity,
    astrogems: [],
  };

  if (astrogemCount > 0) {
    core.astrogems = generateCoreSpecificAstrogems(type, astrogemCount);
  }

  return core;
}

/**
 * Генерирует полный набор из 6 ядер (по одному каждого типа)
 */
export function generateFullCoreSet(
  rarity: CoreRarity = "Relic",
  astrogemsPerCore: number = 0
): Core[] {
  const coreTypes: CoreType[] = [
    "Order of the Sun",
    "Order of the Moon",
    "Order of the Star",
    "Chaos of the Sun",
    "Chaos of the Moon",
    "Chaos of the Star",
  ];

  return coreTypes.map((type) => generateTestCore(type, rarity, astrogemsPerCore));
}

/**
 * Генерирует набор ядер с разными редкостями
 */
export function generateMixedRarityCoreSet(
  rarities: CoreRarity[] = ["Epic", "Legendary", "Relic", "Ancient", "Relic", "Ancient"]
): Core[] {
  const coreTypes: CoreType[] = [
    "Order of the Sun",
    "Order of the Moon",
    "Order of the Star",
    "Chaos of the Sun",
    "Chaos of the Moon",
    "Chaos of the Star",
  ];

  return coreTypes.map((type, index) => {
    const rarity = rarities[index] ?? "Relic";
    return generateTestCore(type, rarity, 0);
  });
}

/**
 * Генерирует высококачественные астрогемы (высокие stats)
 */
export function generateHighQualityAstrogems(
  count: number,
  category: AstrogemCategory
): Astrogem[] {
  const pool: Astrogem[] = [];
  for (let i = 0; i < count; i++) {
    pool.push(
      generateRandomAstrogem({
        category,
        willpowerMin: 2,
        willpowerMax: 4,
        pointsMin: 4,
        pointsMax: 7,
      })
    );
  }
  return pool;
}

/**
 * Генерирует низкокачественные астрогемы (низкие stats)
 */
export function generateLowQualityAstrogems(
  count: number,
  category: AstrogemCategory
): Astrogem[] {
  const pool: Astrogem[] = [];
  for (let i = 0; i < count; i++) {
    pool.push(
      generateRandomAstrogem({
        category,
        willpowerMin: 1,
        willpowerMax: 2,
        pointsMin: 1,
        pointsMax: 3,
      })
    );
  }
  return pool;
}

/**
 * Генерирует смешанный пул с разными качествами астрогемов
 */
export function generateMixedQualityPool(totalCount: number): Astrogem[] {
  const highQualityCount = Math.floor(totalCount * 0.3); // 30% высокого качества
  const mediumQualityCount = Math.floor(totalCount * 0.5); // 50% среднего качества
  const lowQualityCount = totalCount - highQualityCount - mediumQualityCount; // 20% низкого качества

  const orderHigh = Math.floor(highQualityCount / 2);
  const chaosHigh = highQualityCount - orderHigh;

  const orderMedium = Math.floor(mediumQualityCount / 2);
  const chaosMedium = mediumQualityCount - orderMedium;

  const orderLow = Math.floor(lowQualityCount / 2);
  const chaosLow = lowQualityCount - orderLow;

  return [
    ...generateHighQualityAstrogems(orderHigh, "Order"),
    ...generateHighQualityAstrogems(chaosHigh, "Chaos"),
    ...generateAstrogemPool(orderMedium, "Order"),
    ...generateAstrogemPool(chaosMedium, "Chaos"),
    ...generateLowQualityAstrogems(orderLow, "Order"),
    ...generateLowQualityAstrogems(chaosLow, "Chaos"),
  ];
}
