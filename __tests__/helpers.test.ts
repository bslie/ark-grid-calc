import { describe, it, expect } from "vitest";
import {
  generateId,
  createEmptyCore,
  createEmptyAstrogem,
  getCoreCategory,
  getMaxWillpower,
  getBreakpoints,
  calculateTotalWillpower,
  calculateTotalPoints,
  getBreakpointsHit,
  calculateScore,
} from "../lib/arkgrid/helpers";
import type { CoreType, CoreRarity, Astrogem } from "../lib/arkgrid/types";

describe("ArkGrid Helpers Tests", () => {
  describe("generateId", () => {
    it("должен генерировать уникальные ID", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const id = generateId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });

    it("ID должен быть строкой", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("createEmptyCore", () => {
    it("должен создать пустое ядро с правильным типом", () => {
      const coreType: CoreType = "Order of the Sun";
      const core = createEmptyCore(coreType);

      expect(core.type).toBe(coreType);
      expect(core.name).toBe(coreType);
      expect(core.rarity).toBe("Relic"); // По умолчанию
      expect(core.astrogems).toEqual([]);
      expect(core.id).toBeDefined();
    });

    it("должен создать ядро с указанной редкостью", () => {
      const core = createEmptyCore("Chaos of the Moon", "Ancient");
      expect(core.rarity).toBe("Ancient");
    });
  });

  describe("createEmptyAstrogem", () => {
    it("должен создать пустой астрогем Order", () => {
      const gem = createEmptyAstrogem("Order");

      expect(gem.category).toBe("Order");
      expect(gem.name).toBe("");
      expect(gem.willpower).toBeNull();
      expect(gem.points).toBeNull();
      expect(gem.id).toBeDefined();
    });

    it("должен создать пустой астрогем Chaos", () => {
      const gem = createEmptyAstrogem("Chaos");
      expect(gem.category).toBe("Chaos");
    });
  });

  describe("getCoreCategory", () => {
    it("Order ядра должны возвращать Order категорию", () => {
      expect(getCoreCategory("Order of the Sun")).toBe("Order");
      expect(getCoreCategory("Order of the Moon")).toBe("Order");
      expect(getCoreCategory("Order of the Star")).toBe("Order");
    });

    it("Chaos ядра должны возвращать Chaos категорию", () => {
      expect(getCoreCategory("Chaos of the Sun")).toBe("Chaos");
      expect(getCoreCategory("Chaos of the Moon")).toBe("Chaos");
      expect(getCoreCategory("Chaos of the Star")).toBe("Chaos");
    });
  });

  describe("getMaxWillpower", () => {
    it("должен возвращать правильный maxWillpower для каждой редкости", () => {
      expect(getMaxWillpower("Epic")).toBe(9);
      expect(getMaxWillpower("Legendary")).toBe(12);
      expect(getMaxWillpower("Relic")).toBe(15);
      expect(getMaxWillpower("Ancient")).toBe(17);
    });
  });

  describe("getBreakpoints", () => {
    it("Epic должен иметь только [10]", () => {
      expect(getBreakpoints("Epic")).toEqual([10]);
    });

    it("Legendary должен иметь [10, 14]", () => {
      expect(getBreakpoints("Legendary")).toEqual([10, 14]);
    });

    it("Relic должен иметь [10, 14, 17, 18, 19, 20]", () => {
      expect(getBreakpoints("Relic")).toEqual([10, 14, 17, 18, 19, 20]);
    });

    it("Ancient должен иметь [10, 14, 17, 18, 19, 20]", () => {
      expect(getBreakpoints("Ancient")).toEqual([10, 14, 17, 18, 19, 20]);
    });
  });

  describe("calculateTotalWillpower", () => {
    it("должен корректно считать сумму willpower", () => {
      const gems: Astrogem[] = [
        { id: "1", name: "G1", category: "Order", willpower: 2, points: 5 },
        { id: "2", name: "G2", category: "Order", willpower: 3, points: 4 },
        { id: "3", name: "G3", category: "Order", willpower: 4, points: 6 },
      ];

      expect(calculateTotalWillpower(gems)).toBe(9);
    });

    it("должен обрабатывать null willpower как 0", () => {
      const gems: Astrogem[] = [
        { id: "1", name: "G1", category: "Order", willpower: 2, points: 5 },
        { id: "2", name: "G2", category: "Order", willpower: null, points: 4 },
      ];

      expect(calculateTotalWillpower(gems)).toBe(2);
    });

    it("должен возвращать 0 для пустого массива", () => {
      expect(calculateTotalWillpower([])).toBe(0);
    });
  });

  describe("calculateTotalPoints", () => {
    it("должен корректно считать сумму points", () => {
      const gems: Astrogem[] = [
        { id: "1", name: "G1", category: "Order", willpower: 2, points: 5 },
        { id: "2", name: "G2", category: "Order", willpower: 3, points: 4 },
        { id: "3", name: "G3", category: "Order", willpower: 4, points: 6 },
      ];

      expect(calculateTotalPoints(gems)).toBe(15);
    });

    it("должен обрабатывать null points как 0", () => {
      const gems: Astrogem[] = [
        { id: "1", name: "G1", category: "Order", willpower: 2, points: 5 },
        { id: "2", name: "G2", category: "Order", willpower: 3, points: null },
      ];

      expect(calculateTotalPoints(gems)).toBe(5);
    });

    it("должен возвращать 0 для пустого массива", () => {
      expect(calculateTotalPoints([])).toBe(0);
    });
  });

  describe("getBreakpointsHit", () => {
    it("Epic: 10 points -> [10]", () => {
      expect(getBreakpointsHit(10, "Epic")).toEqual([10]);
    });

    it("Epic: 9 points -> []", () => {
      expect(getBreakpointsHit(9, "Epic")).toEqual([]);
    });

    it("Legendary: 14 points -> [10, 14]", () => {
      expect(getBreakpointsHit(14, "Legendary")).toEqual([10, 14]);
    });

    it("Legendary: 12 points -> [10]", () => {
      expect(getBreakpointsHit(12, "Legendary")).toEqual([10]);
    });

    it("Relic: 20 points -> [10, 14, 17, 18, 19, 20]", () => {
      expect(getBreakpointsHit(20, "Relic")).toEqual([10, 14, 17, 18, 19, 20]);
    });

    it("Relic: 17 points -> [10, 14, 17]", () => {
      expect(getBreakpointsHit(17, "Relic")).toEqual([10, 14, 17]);
    });

    it("Ancient: 17 points -> [10, 14, 17]", () => {
      expect(getBreakpointsHit(17, "Ancient")).toEqual([10, 14, 17]);
    });
  });

  describe("calculateScore", () => {
    it("Epic: 10 points -> score 1", () => {
      expect(calculateScore(10, "Epic")).toBe(1);
    });

    it("Legendary: 14 points -> score 6 (10:1 + 14:5)", () => {
      expect(calculateScore(14, "Legendary")).toBe(6);
    });

    it("Relic: 17 points -> score 11 (10:1 + 14:5 + 17:5)", () => {
      expect(calculateScore(17, "Relic")).toBe(11);
    });

    it("Ancient: 17 points -> score 12.5 (10:1 + 14:5 + 17:5 + bonus:1.5)", () => {
      expect(calculateScore(17, "Ancient")).toBe(12.5);
    });

    it("Relic: 20 points -> score 12.5 (10:1 + 14:5 + 17:5 + 18:0.5 + 19:0.5 + 20:0.5)", () => {
      expect(calculateScore(20, "Relic")).toBe(12.5);
    });

    it("Ancient: 20 points -> score 14 (10:1 + 14:5 + 17:5 + bonus:1.5 + 18:0.5 + 19:0.5 + 20:0.5)", () => {
      expect(calculateScore(20, "Ancient")).toBe(14);
    });

    it("0 points -> score 0", () => {
      expect(calculateScore(0, "Epic")).toBe(0);
      expect(calculateScore(0, "Legendary")).toBe(0);
      expect(calculateScore(0, "Relic")).toBe(0);
      expect(calculateScore(0, "Ancient")).toBe(0);
    });
  });
});
