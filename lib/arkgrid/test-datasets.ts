import type { Core, Astrogem, CoreRarity } from "./types";
import {
  generateFullCoreSet,
  generateMixedRarityCoreSet,
  generateBalancedAstrogemPool,
  generateMixedQualityPool,
  generateCoreSpecificAstrogems,
} from "./mock-data-generator";

/**
 * Тестовый набор 1: 6 ядер (по одному каждого типа) с 3-4 рунитами
 */
export function getTestSet1(): { cores: Core[]; astrogems: Astrogem[] } {
  const cores = generateFullCoreSet("Relic", 0);
  
  // Генерируем для каждого ядра по 3-4 рунита
  cores.forEach((core) => {
    const count = Math.random() > 0.5 ? 3 : 4;
    core.astrogems = generateCoreSpecificAstrogems(core.type, count);
  });

  // Собираем все астрогемы в один пул
  const astrogems: Astrogem[] = [];
  cores.forEach((core) => {
    astrogems.push(...core.astrogems);
    core.astrogems = []; // Очищаем ядра для теста солвера
  });

  return { cores, astrogems };
}

/**
 * Тестовый набор 2: 100 рунитов с разными статами (сбалансированный)
 */
export function getTestSet2(): { cores: Core[]; astrogems: Astrogem[] } {
  const cores = generateFullCoreSet("Relic", 0);
  const astrogems = generateBalancedAstrogemPool(100);

  return { cores, astrogems };
}

/**
 * Тестовый набор 3: 100 рунитов смешанного качества
 */
export function getTestSet3(): { cores: Core[]; astrogems: Astrogem[] } {
  const cores = generateFullCoreSet("Relic", 0);
  const astrogems = generateMixedQualityPool(100);

  return { cores, astrogems };
}

/**
 * Тестовый набор 4: 6 ядер разных редкостей (Epic, Legendary, Relic, Ancient)
 */
export function getTestSet4(): { cores: Core[]; astrogems: Astrogem[] } {
  const rarities: CoreRarity[] = [
    "Epic",      // Order of the Sun
    "Legendary", // Order of the Moon
    "Relic",     // Order of the Star
    "Ancient",   // Chaos of the Sun
    "Relic",     // Chaos of the Moon
    "Ancient",   // Chaos of the Star
  ];

  const cores = generateMixedRarityCoreSet(rarities);
  const astrogems = generateBalancedAstrogemPool(80);

  return { cores, astrogems };
}

/**
 * Тестовый набор 5: Только Epic и Legendary ядра с ограниченными рунитами
 */
export function getTestSet5(): { cores: Core[]; astrogems: Astrogem[] } {
  const rarities: CoreRarity[] = [
    "Epic",      // Order of the Sun
    "Epic",      // Order of the Moon
    "Legendary", // Order of the Star
    "Legendary", // Chaos of the Sun
    "Epic",      // Chaos of the Moon
    "Legendary", // Chaos of the Star
  ];

  const cores = generateMixedRarityCoreSet(rarities);
  const astrogems = generateBalancedAstrogemPool(50);

  return { cores, astrogems };
}

/**
 * Тестовый набор 6: Все Ancient ядра с большим пулом рунитов
 */
export function getTestSet6(): { cores: Core[]; astrogems: Astrogem[] } {
  const cores = generateFullCoreSet("Ancient", 0);
  const astrogems = generateMixedQualityPool(120);

  return { cores, astrogems };
}

/**
 * Тестовый набор 7: Смешанные редкости для проверки приоритизации
 */
export function getTestSet7(): { cores: Core[]; astrogems: Astrogem[] } {
  const rarities: CoreRarity[] = [
    "Ancient",   // Order of the Sun
    "Ancient",   // Order of the Moon
    "Epic",      // Order of the Star
    "Relic",     // Chaos of the Sun
    "Legendary", // Chaos of the Moon
    "Epic",      // Chaos of the Star
  ];

  const cores = generateMixedRarityCoreSet(rarities);
  const astrogems = generateBalancedAstrogemPool(60);

  return { cores, astrogems };
}

/**
 * Все тестовые наборы
 */
export const TEST_DATASETS = {
  set1: getTestSet1,
  set2: getTestSet2,
  set3: getTestSet3,
  set4: getTestSet4,
  set5: getTestSet5,
  set6: getTestSet6,
  set7: getTestSet7,
} as const;

/**
 * Вспомогательная функция для логирования тестового набора
 */
export function logTestSet(name: string, cores: Core[], astrogems: Astrogem[]) {
  console.log(`\n=== ${name} ===`);
  console.log(`Ядер: ${cores.length}`);
  cores.forEach((core) => {
    console.log(`  - ${core.name} (${core.rarity})`);
  });
  console.log(`Рунитов: ${astrogems.length}`);
  
  const orderCount = astrogems.filter((a) => a.category === "Order").length;
  const chaosCount = astrogems.filter((a) => a.category === "Chaos").length;
  console.log(`  - Order: ${orderCount}`);
  console.log(`  - Chaos: ${chaosCount}`);

  const avgWillpower = astrogems.reduce((sum, a) => sum + (a.willpower ?? 0), 0) / astrogems.length;
  const avgPoints = astrogems.reduce((sum, a) => sum + (a.points ?? 0), 0) / astrogems.length;
  console.log(`  - Средний Willpower: ${avgWillpower.toFixed(2)}`);
  console.log(`  - Средние Points: ${avgPoints.toFixed(2)}`);
}
