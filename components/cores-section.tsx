"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoreCard } from "@/components/core-card";
import { Plus } from "lucide-react";
import type { Core, SolverResult } from "@/lib/arkgrid";

interface CoresSectionProps {
  cores: Core[];
  showResults: boolean;
  results: SolverResult[];
  onAddCore: () => void;
  onUpdateCore: (index: number, core: Core) => void;
  onRemoveCore: (index: number) => void;
  onRemoveGemFromCore: (gemId: string) => void;
}

export function CoresSection({
  cores,
  showResults,
  results,
  onAddCore,
  onUpdateCore,
  onRemoveCore,
  onRemoveGemFromCore,
}: CoresSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Ядра</h2>
          <p className="text-sm text-muted-foreground">
            Настройте типы и редкость ваших ядер
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2 shadow-sm">
          {cores.length}/6
        </Badge>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cores.map((core, i) => (
          <CoreCard
            key={core.id}
            core={core}
            coreIndex={i}
            onUpdate={(c) => onUpdateCore(i, c)}
            onRemove={() => onRemoveCore(i)}
            onRemoveGemFromCore={onRemoveGemFromCore}
            resultAstrogems={
              showResults ? results.find((r) => r.coreId === core.id)?.astrogems : undefined
            }
            showResults={showResults}
          />
        ))}
        {cores.length > 0 && cores.length < 6 && (
          <Card
            className="group flex min-h-[280px] cursor-pointer items-center justify-center border-2 border-dashed transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
            onClick={onAddCore}
          >
            <CardContent className="flex flex-col items-center gap-3 py-6">
              <div className="rounded-full bg-primary/10 p-4 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                <Plus className="size-8 text-primary" />
              </div>
              <span className="text-base font-semibold text-muted-foreground group-hover:text-primary">
                Добавить ядро
              </span>
            </CardContent>
          </Card>
        )}
      </div>
      {cores.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-6">
              <Plus className="size-12 text-muted-foreground" />
            </div>
            <p className="mb-6 text-lg text-muted-foreground">
              Начните с добавления вашего первого ядра
            </p>
            <Button onClick={onAddCore} size="lg" className="shadow-md">
              <Plus className="mr-2 size-5" />
              Добавить первое ядро
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
