/**
 * Примеры использования Mock Data Generator и Test Datasets
 * 
 * Этот файл демонстрирует различные сценарии использования
 * генератора тестовых данных для разработки и отладки.
 */

import {
  generateRandomAstrogem,
  generateAstrogemPool,
  generateBalancedAstrogemPool,
  generateFullCoreSet,
  generateMixedRarityCoreSet,
  generateHighQualityAstrogems,
  generateLowQualityAstrogems,
  generateMixedQualityPool,
} from "./mock-data-generator";

import {
  TEST_DATASETS,
  logTestSet,
} from "./test-datasets";

import { solveArkGrid } from "./solver";
import type { CoreRarity } from "./types";

/**
 * Пример 1: Быстрый тест с предустановленным набором
 */
export function example1_QuickTest() {
  console.log("\n=== Пример 1: Быстрый тест ===");
  
  const { cores, astrogems } = TEST_DATASETS.set2();
  logTestSet("Набор 2", cores, astrogems);
  
  const results = solveArkGrid(cores, astrogems);
  console.log("\nРезультаты:");
  results.forEach((result, index) => {
    const core = cores[index]!;
    console.log(`${core.name}: ${result.totalPoints}p (${result.astrogems.length} рунитов)`);
  });
}

/**
 * Пример 2: Создание кастомного набора данных
 */
export function example2_CustomDataset() {
  console.log("\n=== Пример 2: Кастомный набор ===");
  
  // Создаём 6 Ancient ядер
  const cores = generateFullCoreSet("Ancient", 0);
  
  // Создаём 150 рунитов высокого качества
  const orderGems = generateHighQualityAstrogems(75, "Order");
  const chaosGems = generateHighQualityAstrogems(75, "Chaos");
  const astrogems = [...orderGems, ...chaosGems];
  
  logTestSet("Кастомный набор", cores, astrogems);
  
  const results = solveArkGrid(cores, astrogems);
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  console.log(`\nОбщий score: ${totalScore.toFixed(2)}`);
}

/**
 * Пример 3: Тестирование с различными редкостями
 */
export function example3_MixedRarities() {
  console.log("\n=== Пример 3: Смешанные редкости ===");
  
  const rarities: CoreRarity[] = [
    "Ancient",   // Order of the Sun
    "Ancient",   // Order of the Moon
    "Relic",     // Order of the Star
    "Legendary", // Chaos of the Sun
    "Epic",      // Chaos of the Moon
    "Epic",      // Chaos of the Star
  ];
  
  const cores = generateMixedRarityCoreSet(rarities);
  const astrogems = generateMixedQualityPool(80);
  
  logTestSet("Смешанные редкости", cores, astrogems);
  
  const results = solveArkGrid(cores, astrogems);
  
  console.log("\nРаспределение по breakpoints:");
  [10, 14, 17, 20].forEach((bp) => {
    const count = results.filter((r) => r.breakpointsHit.includes(bp)).length;
    console.log(`  ${bp}p: ${count} ядер`);
  });
}

/**
 * Пример 4: Анализ качества рунитов
 */
export function example4_QualityAnalysis() {
  console.log("\n=== Пример 4: Анализ качества рунитов ===");
  
  const { cores, astrogems } = TEST_DATASETS.set3();
  
  // Анализ качества до оптимизации
  const highQualityBefore = astrogems.filter(
    (g) => (g.willpower ?? 0) >= 3 && (g.points ?? 0) >= 5
  ).length;
  
  console.log(`Высококачественных рунитов: ${highQualityBefore}/${astrogems.length}`);
  
  const results = solveArkGrid(cores, astrogems);
  
  // Анализ использованных рунитов
  const usedGems = results.flatMap((r) => r.astrogems);
  const highQualityUsed = usedGems.filter(
    (g) => (g.willpower ?? 0) >= 3 && (g.points ?? 0) >= 5
  ).length;
  
  console.log(`Использовано высококачественных: ${highQualityUsed}/${usedGems.length}`);
  console.log(`Процент использования HQ: ${((highQualityUsed / usedGems.length) * 100).toFixed(1)}%`);
}

/**
 * Пример 5: Стресс-тест производительности
 */
export function example5_StressTest() {
  console.log("\n=== Пример 5: Стресс-тест ===");
  
  const testSizes = [50, 100, 150, 200];
  
  testSizes.forEach((size) => {
    const cores = generateFullCoreSet("Relic", 0);
    const astrogems = generateBalancedAstrogemPool(size);
    
    const startTime = Date.now();
    const results = solveArkGrid(cores, astrogems);
    const endTime = Date.now();
    
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const usedGems = results.reduce((sum, r) => sum + r.astrogems.length, 0);
    
    console.log(`${size} рунитов: ${endTime - startTime}ms (score: ${totalScore.toFixed(2)}, использовано: ${usedGems})`);
  });
}

/**
 * Пример 6: Destiny Bonus тестирование
 */
export function example6_DestinyBonus() {
  console.log("\n=== Пример 6: Destiny Bonus ===");
  
  // Создаём набор с гарантией получения Destiny Bonus
  const cores = generateFullCoreSet("Ancient", 0);
  const astrogems = generateHighQualityAstrogems(60, "Order").concat(
    generateHighQualityAstrogems(60, "Chaos")
  );
  
  const results = solveArkGrid(cores, astrogems);
  
  const sunCore = cores.find((c) => c.type === "Order of the Sun")!;
  const moonCore = cores.find((c) => c.type === "Order of the Moon")!;
  
  const sunResult = results.find((r) => r.coreId === sunCore.id)!;
  const moonResult = results.find((r) => r.coreId === moonCore.id)!;
  
  console.log(`Order of the Sun: ${sunResult.totalPoints}p`);
  console.log(`Order of the Moon: ${moonResult.totalPoints}p`);
  
  if (sunResult.totalPoints >= 14 && moonResult.totalPoints >= 14) {
    console.log("✅ Destiny Bonus получен! (+10 к score)");
  } else {
    console.log("❌ Destiny Bonus не получен");
  }
}

/**
 * Пример 7: Сравнение стратегий
 */
export function example7_StrategyComparison() {
  console.log("\n=== Пример 7: Сравнение стратегий ===");
  
  // Стратегия 1: Сбалансированный пул
  const balancedCores = generateFullCoreSet("Relic", 0);
  const balancedGems = generateBalancedAstrogemPool(100);
  const balancedResults = solveArkGrid(balancedCores, balancedGems);
  const balancedScore = balancedResults.reduce((sum, r) => sum + r.score, 0);
  
  // Стратегия 2: Только высокое качество
  const hqCores = generateFullCoreSet("Relic", 0);
  const hqGems = generateHighQualityAstrogems(50, "Order").concat(
    generateHighQualityAstrogems(50, "Chaos")
  );
  const hqResults = solveArkGrid(hqCores, hqGems);
  const hqScore = hqResults.reduce((sum, r) => sum + r.score, 0);
  
  // Стратегия 3: Смешанное качество
  const mixedCores = generateFullCoreSet("Relic", 0);
  const mixedGems = generateMixedQualityPool(100);
  const mixedResults = solveArkGrid(mixedCores, mixedGems);
  const mixedScore = mixedResults.reduce((sum, r) => sum + r.score, 0);
  
  console.log(`Сбалансированный: score ${balancedScore.toFixed(2)}`);
  console.log(`Высокое качество: score ${hqScore.toFixed(2)}`);
  console.log(`Смешанное качество: score ${mixedScore.toFixed(2)}`);
  
  const bestStrategy = Math.max(balancedScore, hqScore, mixedScore);
  if (bestStrategy === hqScore) {
    console.log("\n🏆 Лучшая стратегия: Высокое качество");
  } else if (bestStrategy === balancedScore) {
    console.log("\n🏆 Лучшая стратегия: Сбалансированный");
  } else {
    console.log("\n🏆 Лучшая стратегия: Смешанное качество");
  }
}

/**
 * Пример 8: Отладка конкретного случая
 */
export function example8_DebugCase() {
  console.log("\n=== Пример 8: Отладка ===");
  
  // Создаём специфичный случай для отладки
  const cores = generateMixedRarityCoreSet([
    "Epic",      // Низкий лимит willpower
    "Epic",      
    "Legendary",
    "Legendary",
    "Relic",
    "Ancient",
  ]);
  
  // Создаём ограниченный пул с высокими willpower
  const astrogems = generateAstrogemPool(30, "Order").concat(
    generateAstrogemPool(30, "Chaos")
  );
  
  logTestSet("Debug Case", cores, astrogems);
  
  const results = solveArkGrid(cores, astrogems);
  
  console.log("\nДетальные результаты:");
  results.forEach((result) => {
    const core = cores.find((c) => c.id === result.coreId)!;
    console.log(`\n${core.name} (${core.rarity}):`);
    console.log(`  Points: ${result.totalPoints}`);
    console.log(`  Willpower: ${result.totalWillpower}`);
    console.log(`  Breakpoints: [${result.breakpointsHit.join(", ")}]`);
    console.log(`  Score: ${result.score}`);
    console.log(`  Рунитов: ${result.astrogems.length}`);
  });
}

/**
 * Запуск всех примеров
 */
export function runAllExamples() {
  example1_QuickTest();
  example2_CustomDataset();
  example3_MixedRarities();
  example4_QualityAnalysis();
  example5_StressTest();
  example6_DestinyBonus();
  example7_StrategyComparison();
  example8_DebugCase();
}

// Раскомментируйте для запуска примеров
// runAllExamples();
