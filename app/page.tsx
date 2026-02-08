"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Core, Astrogem, SolverResult, AstrogemCategory } from "@/lib/arkgrid";
import {
  createEmptyCore,
  createEmptyAstrogem,
  solveArkGrid,
  getMaxPossibleScore,
  getDestinyBonus,
  getCoreCategory,
  calculateTotalPoints,
} from "@/lib/arkgrid";
import {
  Character,
  createDefaultCharacter,
  CORE_TYPES,
  STORAGE_KEY_CHARACTERS,
  STORAGE_KEY_ACTIVE,
} from "@/lib/character";
import { AppHeader } from "@/components/app-header";
import { CoresSection } from "@/components/cores-section";
import { RunesSection, type AstrogemFilter } from "@/components/runes-section";
import { DeleteCharacterDialog } from "@/components/delete-character-dialog";
import { OptimizationResults } from "@/components/optimization-results";

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>(() => [
    createDefaultCharacter(),
  ]);
  const [activeCharacterId, setActiveCharacterId] = useState<string>("");
  const [results, setResults] = useState<SolverResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationJustFinished, setCalculationJustFinished] = useState(false);
  const [astrogemFilter, setAstrogemFilter] = useState<AstrogemFilter>("all");
  const [newCharacterName, setNewCharacterName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showAddGem, setShowAddGem] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [showDeleteCharacter, setShowDeleteCharacter] = useState(false);
  const [lastAddedGemId, setLastAddedGemId] = useState<string | null>(null);

  const activeCharacter = useMemo(
    () => characters.find((c) => c.id === activeCharacterId),
    [characters, activeCharacterId]
  );

  const cores = activeCharacter?.cores ?? [];
  const astrogems = activeCharacter?.astrogems ?? [];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHARACTERS);
    const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Character[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCharacters(parsed);
          if (savedActive && parsed.some((c: Character) => c.id === savedActive)) {
            setActiveCharacterId(savedActive);
          } else {
            setActiveCharacterId(parsed[0]!.id);
          }
          return;
        }
      } catch {
        // ignore
      }
    }
    setActiveCharacterId(characters[0]!.id);
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(characters));
    }
  }, [characters]);

  useEffect(() => {
    if (activeCharacterId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeCharacterId);
      setShowResults(false);
      setResults([]);
      setLastAddedGemId(null);
    }
  }, [activeCharacterId]);

  useEffect(() => {
    if (
      lastAddedGemId &&
      !astrogems.some((g) => g.id === lastAddedGemId)
    ) {
      setLastAddedGemId(null);
    } else if (lastAddedGemId) {
      const gem = astrogems.find((g) => g.id === lastAddedGemId);
      if (
        gem &&
        gem.willpower != null &&
        gem.points != null &&
        gem.willpower > 0 &&
        gem.points > 0
      ) {
        setLastAddedGemId(null);
      }
    }
  }, [astrogems, lastAddedGemId]);

  const setCores = useCallback(
    (newCores: Core[]) => {
      if (!activeCharacter) return;
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === activeCharacter.id ? { ...c, cores: newCores } : c
        )
      );
      setShowResults(false);
    },
    [activeCharacter]
  );

  const setAstrogems = useCallback(
    (newAstrogems: Astrogem[]) => {
      if (!activeCharacter) return;
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === activeCharacter.id ? { ...c, astrogems: newAstrogems } : c
        )
      );
      setShowResults(false);
    },
    [activeCharacter]
  );

  const availableCoreTypes = useMemo(() => {
    const used = new Set(cores.map((c) => c.type));
    return CORE_TYPES.filter((t) => !used.has(t));
  }, [cores]);

  const addCore = useCallback(() => {
    if (!activeCharacter || cores.length >= 6 || availableCoreTypes.length === 0)
      return;
    const nextType = availableCoreTypes[0]!;
    setCores([...cores, createEmptyCore(nextType)]);
  }, [activeCharacter, cores, availableCoreTypes, setCores]);

  const removeCore = useCallback(
    (index: number) => {
      if (!activeCharacter) return;
      setCores(cores.filter((_, i) => i !== index));
    },
    [activeCharacter, cores, setCores]
  );

  const updateCore = useCallback(
    (index: number, core: Core) => {
      if (!activeCharacter) return;
      setCores(cores.map((c, i) => (i === index ? core : c)));
    },
    [activeCharacter, cores, setCores]
  );

  const assignAstrogemToCore = useCallback(
    (gemId: string, coreIndex: number) => {
      if (!activeCharacter) return;
      const gem = astrogems.find((g) => g.id === gemId);
      const core = cores[coreIndex];
      if (!gem || !core) return;
      if ((core.astrogems?.length ?? 0) >= 4) return;
      const coreCat = getCoreCategory(core.type);
      if (gem.category !== coreCat) return;
      const newCores = cores.map((c, i) => {
        const without = (c.astrogems ?? []).filter((g) => g.id !== gemId);
        if (i === coreIndex) {
          return { ...c, astrogems: [...without, gem] };
        }
        return { ...c, astrogems: without };
      });
      setCores(newCores);
    },
    [activeCharacter, astrogems, cores, setCores]
  );

  const removeAstrogemFromCore = useCallback(
    (gemId: string) => {
      if (!activeCharacter) return;
      const newCores = cores.map((c) => ({
        ...c,
        astrogems: (c.astrogems ?? []).filter((g) => g.id !== gemId),
      }));
      setCores(newCores);
    },
    [activeCharacter, cores, setCores]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const gemId = String(active.id).replace(/^astrogem-/, "");
      if (!astrogems.some((g) => g.id === gemId)) return;
      const overId = String(over.id);
      if (overId === "runes-pool") {
        removeAstrogemFromCore(gemId);
      } else if (overId.startsWith("core-")) {
        const coreIndex = parseInt(overId.replace(/^core-/, ""), 10);
        if (!isNaN(coreIndex) && coreIndex >= 0 && coreIndex < cores.length) {
          assignAstrogemToCore(gemId, coreIndex);
        }
      } else if (overId.startsWith("astrogem-")) {
        const targetGemId = overId.replace(/^astrogem-/, "");
        const coreIndex = cores.findIndex((c) =>
          (c.astrogems ?? []).some((g) => g.id === targetGemId)
        );
        if (coreIndex >= 0 && coreIndex < cores.length) {
          assignAstrogemToCore(gemId, coreIndex);
        }
      }
    },
    [astrogems, cores, assignAstrogemToCore, removeAstrogemFromCore]
  );

  const addAstrogem = useCallback(
    (category: AstrogemCategory) => {
      if (!activeCharacter) return;
      const newGem = createEmptyAstrogem(category);
      setAstrogems([...astrogems, newGem]);
      setLastAddedGemId(newGem.id);
      setShowAddGem(false);
    },
    [activeCharacter, astrogems, setAstrogems]
  );

  const removeAstrogem = useCallback(
    (id: string) => {
      if (!activeCharacter) return;
      setAstrogems(astrogems.filter((g) => g.id !== id));
    },
    [activeCharacter, astrogems, setAstrogems]
  );

  const runesGroupedForDisplay = useMemo(() => {
    const assignedIds = new Set<string>();
    for (const core of cores) {
      for (const g of core.astrogems ?? []) {
        assignedIds.add(g.id);
      }
    }
    const unassigned = astrogems.filter((g) => !assignedIds.has(g.id));
    let filteredUnassigned = unassigned;
    if (astrogemFilter === "order")
      filteredUnassigned = unassigned.filter((g) => g.category === "Order");
    if (astrogemFilter === "chaos")
      filteredUnassigned = unassigned.filter((g) => g.category === "Chaos");

    const assignedByCore = cores
      .filter((core) => (core.astrogems?.length ?? 0) > 0)
      .filter(
        (core) =>
          astrogemFilter === "all" ||
          (astrogemFilter === "order" &&
            getCoreCategory(core.type) === "Order") ||
          (astrogemFilter === "chaos" &&
            getCoreCategory(core.type) === "Chaos")
      )
      .map((core) => ({
        core,
        totalPoints: calculateTotalPoints(core.astrogems ?? []),
        gems: core.astrogems ?? [],
      }));

    return {
      assignedByCore,
      unassigned: filteredUnassigned,
    };
  }, [cores, astrogems, astrogemFilter]);

  const validAstrogems = useMemo(
    () =>
      astrogems.filter(
        (g) =>
          g.willpower != null &&
          g.points != null &&
          g.willpower > 0 &&
          g.points > 0
      ),
    [astrogems]
  );

  const totalScore = useMemo(() => {
    const base = results.reduce((s, r) => s + r.score, 0);
    return base + getDestinyBonus(cores, results);
  }, [results, cores]);

  const maxPossible = useMemo(() => getMaxPossibleScore(cores), [cores]);

  const calculate = useCallback(async () => {
    if (cores.length === 0 || validAstrogems.length === 0) return;
    setCalculationJustFinished(false);
    setIsCalculating(true);
    setShowResults(false);
    const minLoadingMs = 450;
    const start = Date.now();
    try {
      const plainCores = JSON.parse(JSON.stringify(cores)) as Core[];
      const plainGems = JSON.parse(JSON.stringify(validAstrogems)) as Astrogem[];
      const res = solveArkGrid(plainCores, plainGems);

      const elapsed = Date.now() - start;
      if (elapsed < minLoadingMs) {
        await new Promise((r) => setTimeout(r, minLoadingMs - elapsed));
      }

      setResults(res);
      setShowResults(true);
      setCalculationJustFinished(true);

      const updatedCores = cores.map((core) => {
        const result = res.find((r) => r.coreId === core.id);
        if (result) {
          return { ...core, astrogems: result.astrogems };
        }
        return core;
      });
      setCores(updatedCores);

      requestAnimationFrame(() => {
        document.getElementById("optimization-results")?.scrollIntoView({
          behavior: "smooth",
        });
      });

      setTimeout(() => setCalculationJustFinished(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  }, [cores, validAstrogems, setCores]);

  const resetAll = useCallback(() => {
    if (!activeCharacter) return;
    setCores([]);
    setAstrogems([]);
    setResults([]);
    setShowResults(false);
    setShowReset(false);
  }, [activeCharacter, setCores, setAstrogems]);

  const addCharacter = useCallback(() => {
    const name = newCharacterName.trim() || `Персонаж ${characters.length + 1}`;
    const newChar = createDefaultCharacter(name);
    setCharacters((prev) => [...prev, newChar]);
    setActiveCharacterId(newChar.id);
    setNewCharacterName("");
    setShowAddCharacter(false);
  }, [newCharacterName, characters.length]);

  const deleteCharacter = useCallback(() => {
    if (characters.length <= 1) return;
    const idx = characters.findIndex((c) => c.id === activeCharacterId);
    if (idx !== -1) {
      const next = characters.filter((_, i) => i !== idx);
      setCharacters(next);
      setActiveCharacterId(next[0]?.id ?? "");
    }
    setShowDeleteCharacter(false);
  }, [characters, activeCharacterId]);

  const saveCharacterName = useCallback(
    (name: string) => {
      if (!activeCharacter) return;
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === activeCharacter.id ? { ...c, name } : c
        )
      );
    },
    [activeCharacter]
  );

  const totalAstrogemCount = useMemo(() => astrogems.length, [astrogems]);
  const orderCount = astrogems.filter((g) => g.category === "Order").length;
  const chaosCount = astrogems.filter((g) => g.category === "Chaos").length;

  if (!activeCharacter) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <AppHeader
        characters={characters}
        activeCharacterId={activeCharacterId}
        activeCharacter={activeCharacter}
        onSelectCharacter={setActiveCharacterId}
        showCharactersDialog={showAddCharacter}
        onCharactersDialogChange={setShowAddCharacter}
        newCharacterName={newCharacterName}
        onNewCharacterNameChange={setNewCharacterName}
        onAddCharacter={addCharacter}
        onRequestDeleteCharacter={() => setShowDeleteCharacter(true)}
        editingName={editingName}
        onEditingNameChange={setEditingName}
        editedName={editedName}
        onEditedNameChange={setEditedName}
        onSaveCharacterName={saveCharacterName}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <CoresSection
            cores={cores}
            showResults={showResults}
            results={results}
            onAddCore={addCore}
            onUpdateCore={updateCore}
            onRemoveCore={removeCore}
            onRemoveGemFromCore={removeAstrogemFromCore}
          />

          <RunesSection
            astrogemFilter={astrogemFilter}
            onAstrogemFilterChange={setAstrogemFilter}
            runesGroupedForDisplay={runesGroupedForDisplay}
            astrogems={astrogems}
            onAstrogemsChange={setAstrogems}
            onRemoveAstrogem={removeAstrogem}
            onAddAstrogem={addAstrogem}
            showAddGem={showAddGem}
            onShowAddGemChange={setShowAddGem}
            onCalculate={calculate}
            isCalculating={isCalculating}
            calculationJustFinished={calculationJustFinished}
            canCalculate={cores.length > 0 && validAstrogems.length > 0}
            showReset={showReset}
            onShowResetChange={setShowReset}
            onResetConfirm={resetAll}
            totalCount={totalAstrogemCount}
            orderCount={orderCount}
            chaosCount={chaosCount}
          />

          <DeleteCharacterDialog
            open={showDeleteCharacter}
            onOpenChange={setShowDeleteCharacter}
            characterName={activeCharacter.name}
            onConfirm={deleteCharacter}
          />

          {showResults && results.length > 0 && (
            <OptimizationResults
              results={results}
              cores={cores}
              totalScore={totalScore}
              maxPossible={maxPossible}
            />
          )}
        </DndContext>
      </main>
    </div>
  );
}
