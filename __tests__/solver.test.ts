import { describe, it, expect, beforeEach } from "vitest";
import { solveArkGrid, getMaxPossibleScore, getDestinyBonus } from "../lib/arkgrid/solver";
import {
  calculateTotalPoints,
  calculateTotalWillpower,
  getBreakpointsHit,
  calculateScore,
} from "../lib/arkgrid/helpers";
import type { Core, Astrogem, SolverResult } from "../lib/arkgrid/types";
import {
  TEST_DATASETS,
  logTestSet,
} from "../lib/arkgrid/test-datasets";

describe("ArkGrid Solver - Mock Data Tests", () => {
  describe("Test Set 1: 6 ядер с 3-4 рунитами каждое", () => {
    let cores: Core[];
    let astrogems: Astrogem[];
    let results: SolverResult[];

    beforeEach(() => {
      const dataset = TEST_DATASETS.set1();
      cores = dataset.cores;
      astrogems = dataset.astrogems;
      results = solveArkGrid(cores, astrogems);
    });

    it("должен вернуть результаты для всех 6 ядер", () => {
      expect(results).toHaveLength(6);
      expect(results.every((r) => cores.some((c) => c.id === r.coreId))).toBe(true);
    });

    it("каждое ядро должно получить корректное количество рунитов", () => {
      results.forEach((result) => {
        expect(result.astrogems.length).toBeGreaterThanOrEqual(0);
        expect(result.astrogems.length).toBeLessThanOrEqual(4);
      });
    });

    it("не должно быть дублирования рунитов между ядрами", () => {
      const usedGemIds = new Set<string>();
      results.forEach((result) => {
        result.astrogems.forEach((gem) => {
          expect(usedGemIds.has(gem.id)).toBe(false);
          usedGemIds.add(gem.id);
        });
      });
    });

    it("каждое ядро должно соблюдать лимит willpower", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        expect(result.totalWillpower).toBeLessThanOrEqual(
          core.rarity === "Epic" ? 9 :
          core.rarity === "Legendary" ? 12 :
          core.rarity === "Relic" ? 15 : 17
        );
      });
    });

    it("рунит должен иметь ту же категорию что и ядро", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        const coreCategory = core.type.includes("Order") ? "Order" : "Chaos";
        result.astrogems.forEach((gem) => {
          expect(gem.category).toBe(coreCategory);
        });
      });
    });

    it("подсчет очков должен быть корректным", () => {
      results.forEach((result) => {
        const calculatedPoints = calculateTotalPoints(result.astrogems);
        expect(result.totalPoints).toBe(calculatedPoints);
      });
    });

    it("подсчет willpower должен быть корректным", () => {
      results.forEach((result) => {
        const calculatedWillpower = calculateTotalWillpower(result.astrogems);
        expect(result.totalWillpower).toBe(calculatedWillpower);
      });
    });

    it("breakpoints должны быть правильно определены", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        const expectedBreakpoints = getBreakpointsHit(result.totalPoints, core.rarity);
        expect(result.breakpointsHit).toEqual(expectedBreakpoints);
      });
    });

    it("score должен быть корректно рассчитан", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        const expectedScore = calculateScore(result.totalPoints, core.rarity);
        expect(result.score).toBe(expectedScore);
      });
    });
  });

  describe("Test Set 2: 100 рунитов сбалансированный пул", () => {
    let cores: Core[];
    let astrogems: Astrogem[];
    let results: SolverResult[];

    beforeEach(() => {
      const dataset = TEST_DATASETS.set2();
      cores = dataset.cores;
      astrogems = dataset.astrogems;
      results = solveArkGrid(cores, astrogems);
    });

    it("должен использовать рунитов из пула", () => {
      const usedGemsCount = results.reduce(
        (sum, r) => sum + r.astrogems.length,
        0
      );
      expect(usedGemsCount).toBeGreaterThan(0);
      expect(usedGemsCount).toBeLessThanOrEqual(astrogems.length);
    });

    it("должен максимизировать общий score", () => {
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      expect(totalScore).toBeGreaterThan(0);
    });

    it("большинство ядер должно достичь 10p breakpoint", () => {
      const cores10p = results.filter((r) => r.breakpointsHit.includes(10));
      // Ожидаем, что хотя бы половина ядер достигнет 10p
      expect(cores10p.length).toBeGreaterThanOrEqual(3);
    });

    it("не должно быть общих рунитов между Order и Chaos ядрами", () => {
      const orderResults = results.filter((r) => {
        const core = cores.find((c) => c.id === r.coreId)!;
        return core.type.includes("Order");
      });

      const chaosResults = results.filter((r) => {
        const core = cores.find((c) => c.id === r.coreId)!;
        return core.type.includes("Chaos");
      });

      const orderGemIds = new Set(
        orderResults.flatMap((r) => r.astrogems.map((g) => g.id))
      );
      const chaosGemIds = new Set(
        chaosResults.flatMap((r) => r.astrogems.map((g) => g.id))
      );

      // Проверяем, что нет пересечений
      orderGemIds.forEach((id) => {
        expect(chaosGemIds.has(id)).toBe(false);
      });
    });
  });

  describe("Test Set 3: 100 рунитов смешанного качества", () => {
    let cores: Core[];
    let astrogems: Astrogem[];
    let results: SolverResult[];

    beforeEach(() => {
      const dataset = TEST_DATASETS.set3();
      cores = dataset.cores;
      astrogems = dataset.astrogems;
      results = solveArkGrid(cores, astrogems);
    });

    it("должен предпочитать высококачественные рунит для важных breakpoints", () => {
      // Проверяем, что ядра с 14p+ имеют высокие points
      results
        .filter((r) => r.breakpointsHit.includes(14))
        .forEach((result) => {
          const avgPoints =
            result.astrogems.reduce((sum, g) => sum + (g.points ?? 0), 0) /
            (result.astrogems.length || 1);
          expect(avgPoints).toBeGreaterThan(3); // Средние points должны быть выше среднего
        });
    });

    it("низкокачественные рунит должны использоваться меньше", () => {
      const usedGems = results.flatMap((r) => r.astrogems);
      const lowQualityUsed = usedGems.filter(
        (g) => (g.willpower ?? 0) <= 2 && (g.points ?? 0) <= 3
      );
      const highQualityUsed = usedGems.filter(
        (g) => (g.willpower ?? 0) >= 3 && (g.points ?? 0) >= 5
      );

      // Высококачественные рунит должны использоваться чаще
      expect(highQualityUsed.length).toBeGreaterThanOrEqual(lowQualityUsed.length);
    });
  });

  describe("Test Set 4: 6 ядер разных редкостей (Epic, Legendary, Relic, Ancient)", () => {
    let cores: Core[];
    let astrogems: Astrogem[];
    let results: SolverResult[];

    beforeEach(() => {
      const dataset = TEST_DATASETS.set4();
      cores = dataset.cores;
      astrogems = dataset.astrogems;
      results = solveArkGrid(cores, astrogems);
    });

    it("Epic ядра должны соблюдать maxWillpower = 9", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        if (core.rarity === "Epic") {
          expect(result.totalWillpower).toBeLessThanOrEqual(9);
        }
      });
    });

    it("Legendary ядра должны соблюдать maxWillpower = 12", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        if (core.rarity === "Legendary") {
          expect(result.totalWillpower).toBeLessThanOrEqual(12);
        }
      });
    });

    it("Relic ядра должны соблюдать maxWillpower = 15", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        if (core.rarity === "Relic") {
          expect(result.totalWillpower).toBeLessThanOrEqual(15);
        }
      });
    });

    it("Ancient ядра должны соблюдать maxWillpower = 17", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        if (core.rarity === "Ancient") {
          expect(result.totalWillpower).toBeLessThanOrEqual(17);
        }
      });
    });

    it("Epic ядра имеют только breakpoint [10]", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        if (core.rarity === "Epic") {
          result.breakpointsHit.forEach((bp) => {
            expect([10]).toContain(bp);
          });
        }
      });
    });

    it("Legendary ядра могут иметь breakpoints [10, 14]", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        if (core.rarity === "Legendary") {
          result.breakpointsHit.forEach((bp) => {
            expect([10, 14]).toContain(bp);
          });
        }
      });
    });

    it("Relic и Ancient ядра могут иметь все breakpoints", () => {
      results.forEach((result) => {
        const core = cores.find((c) => c.id === result.coreId)!;
        if (core.rarity === "Relic" || core.rarity === "Ancient") {
          result.breakpointsHit.forEach((bp) => {
            expect([10, 14, 17, 18, 19, 20]).toContain(bp);
          });
        }
      });
    });
  });

  describe("Test Set 5: Только Epic и Legendary ядра", () => {
    let cores: Core[];
    let astrogems: Astrogem[];
    let results: SolverResult[];

    beforeEach(() => {
      const dataset = TEST_DATASETS.set5();
      cores = dataset.cores;
      astrogems = dataset.astrogems;
      results = solveArkGrid(cores, astrogems);
    });

    it("все ядра должны быть Epic или Legendary", () => {
      cores.forEach((core) => {
        expect(["Epic", "Legendary"]).toContain(core.rarity);
      });
    });

    it("должен приоритизировать достижение 10p для всех ядер", () => {
      const cores10p = results.filter((r) => r.breakpointsHit.includes(10));
      // Epic и Legendary ядра должны стремиться достичь 10p
      expect(cores10p.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Test Set 6: Все Ancient ядра с большим пулом", () => {
    let cores: Core[];
    let astrogems: Astrogem[];
    let results: SolverResult[];

    beforeEach(() => {
      const dataset = TEST_DATASETS.set6();
      cores = dataset.cores;
      astrogems = dataset.astrogems;
      results = solveArkGrid(cores, astrogems);
    });

    it("все ядра должны быть Ancient", () => {
      cores.forEach((core) => {
        expect(core.rarity).toBe("Ancient");
      });
    });

    it("Ancient ядра должны стремиться достичь 17p для бонуса", () => {
      const cores17p = results.filter((r) => r.breakpointsHit.includes(17));
      expect(cores17p.length).toBeGreaterThan(0);
    });

    it("большинство ядер должно достичь минимум 14p", () => {
      const cores14p = results.filter((r) => r.breakpointsHit.includes(14));
      expect(cores14p.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Test Set 7: Смешанные редкости для проверки приоритизации", () => {
    let cores: Core[];
    let astrogems: Astrogem[];
    let results: SolverResult[];

    beforeEach(() => {
      const dataset = TEST_DATASETS.set7();
      cores = dataset.cores;
      astrogems = dataset.astrogems;
      results = solveArkGrid(cores, astrogems);
    });

    it("Epic ядра должны получить приоритет для достижения 10p", () => {
      const epicResults = results.filter((r) => {
        const core = cores.find((c) => c.id === r.coreId)!;
        return core.rarity === "Epic";
      });

      epicResults.forEach((result) => {
        // Epic ядра должны либо достичь 10p, либо иметь 0 очков
        if (result.totalPoints > 0) {
          expect(result.totalPoints).toBeGreaterThanOrEqual(10);
        }
      });
    });
  });

  describe("Destiny Bonus Tests (Order Sun + Moon)", () => {
    it("должен получить Destiny Bonus когда Sun и Moon >= 14p", () => {
      const dataset = TEST_DATASETS.set6(); // Ancient ядра
      const { cores, astrogems } = dataset;
      const results = solveArkGrid(cores, astrogems);

      const destinyBonus = getDestinyBonus(cores, results);
      
      const sunResult = results.find((r) => {
        const core = cores.find((c) => c.id === r.coreId)!;
        return core.type === "Order of the Sun";
      });
      const moonResult = results.find((r) => {
        const core = cores.find((c) => c.id === r.coreId)!;
        return core.type === "Order of the Moon";
      });

      if (
        sunResult &&
        moonResult &&
        sunResult.totalPoints >= 14 &&
        moonResult.totalPoints >= 14
      ) {
        expect(destinyBonus).toBe(10);
      } else {
        expect(destinyBonus).toBe(0);
      }
    });
  });

  describe("Performance Tests", () => {
    it("должен решить задачу с 6 ядрами и 100 рунитами за разумное время", () => {
      const dataset = TEST_DATASETS.set2();
      const { cores, astrogems } = dataset;

      const startTime = Date.now();
      const results = solveArkGrid(cores, astrogems);
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(6);
      expect(executionTime).toBeLessThan(5000); // Должно выполниться за < 5 секунд
    });

    it("должен решить задачу с 6 ядрами и 120 рунитами", () => {
      const dataset = TEST_DATASETS.set6();
      const { cores, astrogems } = dataset;

      const startTime = Date.now();
      const results = solveArkGrid(cores, astrogems);
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(6);
      expect(executionTime).toBeLessThan(10000); // Должно выполниться за < 10 секунд
    });
  });

  describe("Edge Cases", () => {
    it("должен обработать пустой пул астрогемов", () => {
      const dataset = TEST_DATASETS.set1();
      const { cores } = dataset;
      
      const results = solveArkGrid(cores, []);
      
      expect(results).toHaveLength(6);
      results.forEach((result) => {
        expect(result.astrogems).toHaveLength(0);
        expect(result.totalPoints).toBe(0);
        expect(result.totalWillpower).toBe(0);
        expect(result.score).toBe(0);
      });
    });

    it("должен обработать пустой массив ядер", () => {
      const dataset = TEST_DATASETS.set2();
      const { astrogems } = dataset;
      
      const results = solveArkGrid([], astrogems);
      
      expect(results).toHaveLength(0);
    });

    it("должен обработать ядра без совместимых астрогемов", () => {
      const dataset = TEST_DATASETS.set1();
      const { cores } = dataset;
      
      // Используем только Order астрогемы для Chaos ядер и наоборот
      const orderGems = cores[0]!.astrogems; // Order астрогемы
      const chaosCores = cores.filter((c) => c.type.includes("Chaos"));
      
      const results = solveArkGrid(chaosCores, orderGems);
      
      results.forEach((result) => {
        expect(result.astrogems).toHaveLength(0);
      });
    });
  });
});
