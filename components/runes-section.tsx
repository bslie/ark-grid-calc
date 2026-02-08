"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AstrogemRow } from "@/components/astrogem-row";
import { RunesPoolDroppable } from "@/components/runes-pool-droppable";
import { AddGemDialog } from "@/components/add-gem-dialog";
import { ResetDialog } from "@/components/reset-dialog";
import { CORE_TYPE_LABELS } from "@/lib/arkgrid";
import type { Core, Astrogem, CoreType } from "@/lib/arkgrid";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, Loader2, RotateCcw, CheckCircle2, Zap, Target } from "lucide-react";

export type AstrogemFilter = "all" | "order" | "chaos";

interface RunesGroupedForDisplay {
  assignedByCore: {
    core: Core;
    totalPoints: number;
    gems: Astrogem[];
  }[];
  unassigned: Astrogem[];
}

interface RunesSectionProps {
  astrogemFilter: AstrogemFilter;
  onAstrogemFilterChange: (f: AstrogemFilter) => void;
  runesGroupedForDisplay: RunesGroupedForDisplay;
  astrogems: Astrogem[];
  onAstrogemsChange: (gems: Astrogem[]) => void;
  onRemoveAstrogem: (id: string) => void;
  onAddAstrogem: (category: "Order" | "Chaos") => void;
  showAddGem: boolean;
  onShowAddGemChange: (open: boolean) => void;
  onCalculate: () => void;
  isCalculating: boolean;
  calculationJustFinished?: boolean;
  canCalculate: boolean;
  showReset: boolean;
  onShowResetChange: (open: boolean) => void;
  onResetConfirm: () => void;
  totalCount: number;
  orderCount: number;
  chaosCount: number;
}

export function RunesSection({
  astrogemFilter,
  onAstrogemFilterChange,
  runesGroupedForDisplay,
  astrogems,
  onAstrogemsChange,
  onRemoveAstrogem,
  onAddAstrogem,
  showAddGem,
  onShowAddGemChange,
  onCalculate,
  isCalculating,
  calculationJustFinished = false,
  canCalculate,
  showReset,
  onShowResetChange,
  onResetConfirm,
  totalCount,
  orderCount,
  chaosCount,
}: RunesSectionProps) {
  const updateAstrogem = (g: Astrogem) => {
    const idx = astrogems.findIndex((x) => x.id === g.id);
    if (idx === -1) return;
    const next = [...astrogems];
    next[idx] = g;
    onAstrogemsChange(next);
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Руниты</h2>
          <p className="text-sm text-muted-foreground">
            Управление вашей коллекцией рунитов
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            Всего: <span className="ml-1 font-bold">{totalCount}</span>
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-1 border-red-500/30 bg-red-500/5"
          >
            Порядок:{" "}
            <span className="ml-1 font-bold text-red-600 dark:text-red-400">
              {orderCount}
            </span>
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-1 border-blue-500/30 bg-blue-500/5"
          >
            Хаос:{" "}
            <span className="ml-1 font-bold text-blue-600 dark:text-blue-400">
              {chaosCount}
            </span>
          </Badge>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card/50 p-3 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Фильтр:
        </span>
        {(["all", "order", "chaos"] as const).map((f) => (
          <Button
            key={f}
            variant={astrogemFilter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => onAstrogemFilterChange(f)}
            className={cn("transition-all", astrogemFilter === f && "shadow-md")}
          >
            {f === "all" ? "Все" : f === "order" ? "Порядок" : "Хаос"}
          </Button>
        ))}
      </div>

      <RunesPoolDroppable className="space-y-4">
        {runesGroupedForDisplay.assignedByCore.map(
          ({ core, totalPoints, gems }) => (
            <div key={core.id} className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 font-medium">
                <span className="text-primary">
                  {CORE_TYPE_LABELS[core.type as CoreType]}
                </span>
                <Badge variant="secondary">{totalPoints} оч.</Badge>
              </div>
              <div className="ml-2 hidden py-1 sm:block" aria-hidden>
                <div className="flex flex-row items-center gap-4 pl-4 pr-3">
                  <div className="w-0 flex-none sm:w-40" />
                  <div className="ml-auto flex items-center gap-2">
                    <span className="flex w-14 items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                      <Zap className="size-3.5 shrink-0" />
                      Заряды
                    </span>
                    <span className="flex w-14 items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                      <Target className="size-3.5 shrink-0" />
                      Очки
                    </span>
                    <span className="w-9 shrink-0" aria-hidden />
                  </div>
                </div>
              </div>
              <div className="ml-2 space-y-2">
                {gems.map((gem) => (
                  <AstrogemRow
                    key={gem.id}
                    astrogem={gem}
                    onUpdate={updateAstrogem}
                    onRemove={() => onRemoveAstrogem(gem.id)}
                    assignedTo={CORE_TYPE_LABELS[core.type as CoreType]}
                  />
                ))}
              </div>
            </div>
          )
        )}
        {runesGroupedForDisplay.unassigned.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 font-medium text-amber-700 dark:text-amber-400">
              Не задействованы
            </div>
            <div className="ml-2 hidden py-1 sm:block" aria-hidden>
              <div className="flex flex-row items-center gap-4 pl-4 pr-3">
                <div className="w-0 flex-none sm:w-40" />
                <div className="ml-auto flex items-center gap-2">
                  <span className="flex w-14 items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                    <Zap className="size-3.5 shrink-0" />
                    Заряды
                  </span>
                  <span className="flex w-14 items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                    <Target className="size-3.5 shrink-0" />
                    Очки
                  </span>
                  <span className="w-9 shrink-0" aria-hidden />
                </div>
              </div>
            </div>
            <div className="ml-2 space-y-2">
              {runesGroupedForDisplay.unassigned.map((gem) => (
                <AstrogemRow
                  key={gem.id}
                  astrogem={gem}
                  onUpdate={updateAstrogem}
                  onRemove={() => onRemoveAstrogem(gem.id)}
                  assignedTo={undefined}
                />
              ))}
            </div>
          </div>
        )}
      </RunesPoolDroppable>

      {astrogems.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-6">
              <Sparkles className="size-12 text-muted-foreground" />
            </div>
            <p className="mb-2 text-lg font-semibold">Руниты не добавлены</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Добавьте руниты для начала оптимизации
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <AddGemDialog
          open={showAddGem}
          onOpenChange={onShowAddGemChange}
          onAdd={onAddAstrogem}
        >
          <Button
            variant="outline"
            size="lg"
            className="shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="mr-2 size-5" />
            Добавить рунит
          </Button>
        </AddGemDialog>

        <Button
          onClick={onCalculate}
          disabled={!canCalculate || isCalculating}
          size="lg"
          className={cn(
            "shadow-md hover:shadow-lg transition-all duration-300",
            calculationJustFinished &&
              "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
          )}
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Расчёт…
            </>
          ) : calculationJustFinished ? (
            <>
              <CheckCircle2 className="mr-2 size-5 animate-pulse" />
              Готово!
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-5" />
              Рассчитать оптимальное назначение
            </>
          )}
        </Button>

        <ResetDialog
          open={showReset}
          onOpenChange={onShowResetChange}
          onConfirm={onResetConfirm}
        >
          <Button
            variant="outline"
            size="lg"
            title="Сбросить всё"
            className="shadow-md"
          >
            <RotateCcw className="mr-2 size-5" />
            Сбросить
          </Button>
        </ResetDialog>
      </div>
    </section>
  );
}
