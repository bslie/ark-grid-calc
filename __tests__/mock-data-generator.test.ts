import { describe, it, expect } from "vitest";
import {
  generateRandomAstrogem,
  generateAstrogemPool,
  generateBalancedAstrogemPool,
  generateCoreSpecificAstrogems,
  generateTestCore,
  generateFullCoreSet,
  generateMixedRarityCoreSet,
  generateHighQualityAstrogems,
  generateLowQualityAstrogems,
  generateMixedQualityPool,
} from "../lib/arkgrid/mock-data-generator";
import type { CoreType, CoreRarity } from "../lib/arkgrid/types";

describe("Mock Data Generator Tests", () => {
  describe("generateRandomAstrogem", () => {
    it("должен генерировать астрогем Order с валидными значениями", () => {
      const gem = generateRandomAstrogem({ category: "Order" });

      expect(gem.category).toBe("Order");
      expect(gem.willpower).toBeGreaterThanOrEqual(1);
      expect(gem.willpower).toBeLessThanOrEqual(4);
      expect(gem.points).toBeGreaterThanOrEqual(1);
      expect(gem.points).toBeLessThanOrEqual(7);
      expect(gem.id).toBeDefined();
      expect(gem.name).toContain("Порядок");
    });

    it("должен генерировать астрогем Chaos с валидными значениями", () => {
      const gem = generateRandomAstrogem({ category: "Chaos" });

      expect(gem.category).toBe("Chaos");
      expect(gem.willpower).toBeGreaterThanOrEqual(1);
      expect(gem.willpower).toBeLessThanOrEqual(4);
      expect(gem.points).toBeGreaterThanOrEqual(1);
      expect(gem.points).toBeLessThanOrEqual(7);
      expect(gem.name).toContain("Хаос");
    });

    it("должен соблюдать кастомные ограничения willpower", () => {
      const gem = generateRandomAstrogem({
        category: "Order",
        willpowerMin: 2,
        willpowerMax: 3,
      });

      expect(gem.willpower).toBeGreaterThanOrEqual(2);
      expect(gem.willpower).toBeLessThanOrEqual(3);
    });

    it("должен соблюдать кастомные ограничения points", () => {
      const gem = generateRandomAstrogem({
        category: "Chaos",
        pointsMin: 5,
        pointsMax: 7,
      });

      expect(gem.points).toBeGreaterThanOrEqual(5);
      expect(gem.points).toBeLessThanOrEqual(7);
    });
  });

  describe("generateAstrogemPool", () => {
    it("должен генерировать заданное количество астрогемов", () => {
      const pool = generateAstrogemPool(10, "Order");

      expect(pool).toHaveLength(10);
      pool.forEach((gem) => {
        expect(gem.category).toBe("Order");
      });
    });

    it("все астрогемы должны иметь уникальные ID", () => {
      const pool = generateAstrogemPool(50, "Chaos");
      const ids = new Set(pool.map((g) => g.id));

      expect(ids.size).toBe(50);
    });

    it("должен работать с нулевым количеством", () => {
      const pool = generateAstrogemPool(0, "Order");
      expect(pool).toHaveLength(0);
    });
  });

  describe("generateBalancedAstrogemPool", () => {
    it("должен генерировать ~50% Order и ~50% Chaos", () => {
      const pool = generateBalancedAstrogemPool(100);

      expect(pool).toHaveLength(100);

      const orderCount = pool.filter((g) => g.category === "Order").length;
      const chaosCount = pool.filter((g) => g.category === "Chaos").length;

      expect(orderCount).toBeCloseTo(50, 1);
      expect(chaosCount).toBeCloseTo(50, 1);
      expect(orderCount + chaosCount).toBe(100);
    });

    it("должен работать с нечетным количеством", () => {
      const pool = generateBalancedAstrogemPool(101);

      expect(pool).toHaveLength(101);

      const orderCount = pool.filter((g) => g.category === "Order").length;
      const chaosCount = pool.filter((g) => g.category === "Chaos").length;

      expect(orderCount + chaosCount).toBe(101);
    });
  });

  describe("generateCoreSpecificAstrogems", () => {
    it("Order ядра должны генерировать Order астрогемы", () => {
      const coreTypes: CoreType[] = [
        "Order of the Sun",
        "Order of the Moon",
        "Order of the Star",
      ];

      coreTypes.forEach((type) => {
        const gems = generateCoreSpecificAstrogems(type, 5);
        expect(gems).toHaveLength(5);
        gems.forEach((gem) => {
          expect(gem.category).toBe("Order");
        });
      });
    });

    it("Chaos ядра должны генерировать Chaos астрогемы", () => {
      const coreTypes: CoreType[] = [
        "Chaos of the Sun",
        "Chaos of the Moon",
        "Chaos of the Star",
      ];

      coreTypes.forEach((type) => {
        const gems = generateCoreSpecificAstrogems(type, 5);
        expect(gems).toHaveLength(5);
        gems.forEach((gem) => {
          expect(gem.category).toBe("Chaos");
        });
      });
    });
  });

  describe("generateTestCore", () => {
    it("должен генерировать ядро без астрогемов", () => {
      const core = generateTestCore("Order of the Sun", "Relic", 0);

      expect(core.type).toBe("Order of the Sun");
      expect(core.rarity).toBe("Relic");
      expect(core.astrogems).toHaveLength(0);
      expect(core.id).toBeDefined();
      expect(core.name).toBe("Order of the Sun");
    });

    it("должен генерировать ядро с астрогемами", () => {
      const core = generateTestCore("Chaos of the Moon", "Ancient", 4);

      expect(core.type).toBe("Chaos of the Moon");
      expect(core.rarity).toBe("Ancient");
      expect(core.astrogems).toHaveLength(4);
      core.astrogems.forEach((gem) => {
        expect(gem.category).toBe("Chaos");
      });
    });
  });

  describe("generateFullCoreSet", () => {
    it("должен генерировать 6 ядер всех типов", () => {
      const cores = generateFullCoreSet("Relic", 0);

      expect(cores).toHaveLength(6);

      const types = cores.map((c) => c.type);
      expect(types).toContain("Order of the Sun");
      expect(types).toContain("Order of the Moon");
      expect(types).toContain("Order of the Star");
      expect(types).toContain("Chaos of the Sun");
      expect(types).toContain("Chaos of the Moon");
      expect(types).toContain("Chaos of the Star");

      cores.forEach((core) => {
        expect(core.rarity).toBe("Relic");
      });
    });

    it("должен генерировать ядра с астрогемами", () => {
      const cores = generateFullCoreSet("Ancient", 3);

      expect(cores).toHaveLength(6);
      cores.forEach((core) => {
        expect(core.astrogems).toHaveLength(3);
      });
    });

    it("все ядра должны иметь уникальные ID", () => {
      const cores = generateFullCoreSet("Legendary", 0);
      const ids = new Set(cores.map((c) => c.id));

      expect(ids.size).toBe(6);
    });
  });

  describe("generateMixedRarityCoreSet", () => {
    it("должен генерировать ядра с заданными редкостями", () => {
      const rarities: CoreRarity[] = [
        "Epic",
        "Legendary",
        "Relic",
        "Ancient",
        "Epic",
        "Legendary",
      ];

      const cores = generateMixedRarityCoreSet(rarities);

      expect(cores).toHaveLength(6);
      cores.forEach((core, index) => {
        expect(core.rarity).toBe(rarities[index]);
      });
    });

    it("должен использовать дефолтные редкости при неполном массиве", () => {
      const rarities: CoreRarity[] = ["Epic", "Legendary"];
      const cores = generateMixedRarityCoreSet(rarities);

      expect(cores).toHaveLength(6);
      expect(cores[0]!.rarity).toBe("Epic");
      expect(cores[1]!.rarity).toBe("Legendary");
      // Остальные должны быть "Relic" (дефолт)
      expect(cores[2]!.rarity).toBe("Relic");
    });
  });

  describe("generateHighQualityAstrogems", () => {
    it("должен генерировать высококачественные астрогемы", () => {
      const gems = generateHighQualityAstrogems(20, "Order");

      expect(gems).toHaveLength(20);
      gems.forEach((gem) => {
        expect(gem.category).toBe("Order");
        expect(gem.willpower).toBeGreaterThanOrEqual(2);
        expect(gem.willpower).toBeLessThanOrEqual(4);
        expect(gem.points).toBeGreaterThanOrEqual(4);
        expect(gem.points).toBeLessThanOrEqual(7);
      });
    });

    it("средние stats должны быть выше базовых", () => {
      const gems = generateHighQualityAstrogems(50, "Chaos");

      const avgWillpower = gems.reduce((sum, g) => sum + (g.willpower ?? 0), 0) / 50;
      const avgPoints = gems.reduce((sum, g) => sum + (g.points ?? 0), 0) / 50;

      expect(avgWillpower).toBeGreaterThan(2.5);
      expect(avgPoints).toBeGreaterThan(5);
    });
  });

  describe("generateLowQualityAstrogems", () => {
    it("должен генерировать низкокачественные астрогемы", () => {
      const gems = generateLowQualityAstrogems(20, "Chaos");

      expect(gems).toHaveLength(20);
      gems.forEach((gem) => {
        expect(gem.category).toBe("Chaos");
        expect(gem.willpower).toBeGreaterThanOrEqual(1);
        expect(gem.willpower).toBeLessThanOrEqual(2);
        expect(gem.points).toBeGreaterThanOrEqual(1);
        expect(gem.points).toBeLessThanOrEqual(3);
      });
    });

    it("средние stats должны быть ниже базовых", () => {
      const gems = generateLowQualityAstrogems(50, "Order");

      const avgWillpower = gems.reduce((sum, g) => sum + (g.willpower ?? 0), 0) / 50;
      const avgPoints = gems.reduce((sum, g) => sum + (g.points ?? 0), 0) / 50;

      expect(avgWillpower).toBeLessThan(2);
      expect(avgPoints).toBeLessThan(2.5);
    });
  });

  describe("generateMixedQualityPool", () => {
    it("должен генерировать смешанный пул с правильными пропорциями", () => {
      const pool = generateMixedQualityPool(100);

      expect(pool).toHaveLength(100);

      // ~30% высокого качества (willpower >= 2, points >= 4)
      const highQuality = pool.filter(
        (g) => (g.willpower ?? 0) >= 2 && (g.points ?? 0) >= 4
      );

      // ~20% низкого качества (willpower <= 2, points <= 3)
      const lowQuality = pool.filter(
        (g) => (g.willpower ?? 0) <= 2 && (g.points ?? 0) <= 3
      );

      expect(highQuality.length).toBeGreaterThan(20);
      expect(lowQuality.length).toBeGreaterThan(10);
    });

    it("должен быть сбалансирован по категориям", () => {
      const pool = generateMixedQualityPool(100);

      const orderCount = pool.filter((g) => g.category === "Order").length;
      const chaosCount = pool.filter((g) => g.category === "Chaos").length;

      expect(orderCount).toBeCloseTo(50, 5);
      expect(chaosCount).toBeCloseTo(50, 5);
    });
  });

  describe("Игровые ограничения", () => {
    it("все астрогемы должны соблюдать willpower: 1-4", () => {
      const pool = generateBalancedAstrogemPool(100);

      pool.forEach((gem) => {
        expect(gem.willpower).toBeGreaterThanOrEqual(1);
        expect(gem.willpower).toBeLessThanOrEqual(4);
      });
    });

    it("все астрогемы должны соблюдать points: 1-7", () => {
      const pool = generateBalancedAstrogemPool(100);

      pool.forEach((gem) => {
        expect(gem.points).toBeGreaterThanOrEqual(1);
        expect(gem.points).toBeLessThanOrEqual(7);
      });
    });

    it("willpower и points не должны быть null", () => {
      const pool = generateBalancedAstrogemPool(50);

      pool.forEach((gem) => {
        expect(gem.willpower).not.toBeNull();
        expect(gem.points).not.toBeNull();
      });
    });
  });
});
