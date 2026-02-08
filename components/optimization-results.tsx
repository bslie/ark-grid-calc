"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CORE_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/arkgrid";
import type { Core, SolverResult } from "@/lib/arkgrid";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface OptimizationResultsProps {
  results: SolverResult[];
  cores: Core[];
  totalScore: number;
  maxPossible: number;
}

export function OptimizationResults({
  results,
  cores,
  totalScore,
  maxPossible,
}: OptimizationResultsProps) {
  return (
    <section
      id="optimization-results"
      className="scroll-mt-4 rounded-2xl border-2 bg-gradient-to-br from-card to-card/50 p-8 shadow-xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Sparkles className="size-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Результаты оптимизации</h2>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Общий счет
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {totalScore.toFixed(1)}
              </span>
              <span className="text-lg text-muted-foreground">
                / {maxPossible.toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Брейкпоинт 17
            </p>
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {results.filter((r) => r.breakpointsHit.includes(17)).length}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">ядер</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Брейкпоинт 14
            </p>
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {results.filter((r) => r.breakpointsHit.includes(14)).length}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">ядер</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Всего камней
            </p>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {results.reduce((s, r) => s + r.astrogems.length, 0)}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">шт.</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {results.map((result) => {
          const core = cores.find((c) => c.id === result.coreId);
          if (!core) return null;
          const coreCategory = core.type.includes("Order") ? "order" : "chaos";

          return (
            <Card
              key={result.coreId}
              className={cn(
                "border-2 transition-all hover:shadow-lg",
                coreCategory === "order"
                  ? "border-red-500/30 bg-gradient-to-r from-red-500/5 to-orange-500/5"
                  : "border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-12 rounded-lg border-2 p-1",
                      coreCategory === "order"
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-blue-500/30 bg-blue-500/10"
                    )}
                  >
                    <div className="size-full rounded bg-gradient-to-br from-primary/20 to-primary/5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">
                      {CORE_TYPE_LABELS[core.type]}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {result.totalWillpower} заряд · {result.totalPoints} очков
                      · {result.astrogems.length} камней
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.breakpointsHit.map((bp) => (
                      <Badge
                        key={bp}
                        className="bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30 font-semibold"
                      >
                        {bp}п ✓
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {result.astrogems.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/20 py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Камни не назначены
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {result.astrogems.map((gem) => (
                      <div
                        key={gem.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2",
                          gem.category === "Order"
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-blue-500/30 bg-blue-500/5"
                        )}
                      >
                        <div
                          className={cn(
                            "size-2.5 rounded-full",
                            gem.category === "Order"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          )}
                        />
                        <span
                          className={cn(
                            "flex-1 text-sm font-semibold",
                            gem.category === "Order"
                              ? "text-red-600 dark:text-red-400"
                              : "text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {CATEGORY_LABELS[gem.category]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {gem.willpower}⚡
                        </span>
                        <span className="text-xs font-medium">{gem.points}п</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
