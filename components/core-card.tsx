"use client";

import type { Core, Astrogem, CoreRarity, CoreType } from "@/lib/arkgrid";
import {
  CORE_CONFIG,
  CORE_TYPE_LABELS,
  RARITY_LABELS,
} from "@/lib/arkgrid";
import {
  calculateTotalWillpower,
  calculateTotalPoints,
  getBreakpointsHit,
} from "@/lib/arkgrid";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2 } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/arkgrid";
import Image from "next/image";

const RARITY_COLORS: Record<CoreRarity, string> = {
  Epic: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
  Legendary: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  Relic: "bg-orange-600/25 text-orange-800 dark:text-orange-200 border-orange-600/40",
  Ancient: "bg-amber-600/25 text-amber-800 dark:text-amber-200 border-amber-600/40",
};

const CORE_IMAGES: Record<CoreType, string> = {
  "Order of the Sun": "/images/cores/order-sun.png",
  "Order of the Moon": "/images/cores/order-moon.png",
  "Order of the Star": "/images/cores/order-star.png",
  "Chaos of the Sun": "/images/cores/chaos-sun.png",
  "Chaos of the Moon": "/images/cores/chaos-moon.png",
  "Chaos of the Star": "/images/cores/chaos-star.png",
};

const CORE_TYPES: CoreType[] = [
  "Order of the Sun",
  "Order of the Moon",
  "Order of the Star",
  "Chaos of the Sun",
  "Chaos of the Moon",
  "Chaos of the Star",
];

const RARITIES: CoreRarity[] = ["Epic", "Legendary", "Relic", "Ancient"];

interface CoreCardProps {
  core: Core;
  coreIndex: number;
  onUpdate: (core: Core) => void;
  onRemove: () => void;
  onRemoveGemFromCore?: (gemId: string) => void;
  resultAstrogems?: Astrogem[];
  showResults?: boolean;
}

function CoreAstrogemsSlot({
  coreIndex,
  coreCategory,
  displayAstrogems,
  showResults,
  onRemoveGemFromCore,
  onUpdate,
  core,
}: {
  coreIndex: number;
  coreCategory: "order" | "chaos";
  displayAstrogems: Astrogem[];
  showResults: boolean;
  onRemoveGemFromCore?: (gemId: string) => void;
  onUpdate: (core: Core) => void;
  core: Core;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `core-${coreIndex}`,
    data: { coreIndex },
  });

  if (displayAstrogems.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "rounded-lg border border-dashed py-4 text-center transition-colors min-h-[80px] flex items-center justify-center",
          isOver && "bg-primary/10 border-primary/50",
          !isOver && "bg-muted/20"
        )}
      >
        <p className="text-sm text-muted-foreground">
          {isOver ? "Отпустите, чтобы добавить" : "Перетащите рунит сюда"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "space-y-1.5 rounded-lg transition-colors p-1 -m-1",
        isOver && "bg-primary/5"
      )}
    >
      {showResults ? (
        displayAstrogems.map((gem) => (
          <div
            key={gem.id}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 transition-all hover:scale-[1.02]",
              gem.category === "Order"
                ? "border-red-500/30 bg-red-500/5"
                : "border-blue-500/30 bg-blue-500/5"
            )}
          >
            <div
              className={cn(
                "size-2 rounded-full",
                gem.category === "Order" ? "bg-red-500" : "bg-blue-500"
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
            <span className="text-xs font-medium text-foreground">
              {gem.points}п
            </span>
          </div>
        ))
      ) : (
        displayAstrogems.map((gem) => (
          <DraggableGemItem
            key={gem.id}
            gem={gem}
            onRemove={() => {
              if (onRemoveGemFromCore) {
                onRemoveGemFromCore(gem.id);
              } else {
                onUpdate({
                  ...core,
                  astrogems: (core.astrogems ?? []).filter((g) => g.id !== gem.id),
                });
              }
            }}
          />
        ))
      )}
    </div>
  );
}

function DraggableGemItem({
  gem,
  onRemove,
}: {
  gem: Astrogem;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `astrogem-${gem.id}`,
    data: { gem },
  });
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 transition-all hover:scale-[1.02]",
        gem.category === "Order"
          ? "border-red-500/30 bg-red-500/5"
          : "border-blue-500/30 bg-blue-500/5",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <button
        type="button"
        className="touch-none shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...listeners}
        {...attributes}
        aria-label="Перетащить"
      >
        <GripVertical className="size-4" />
      </button>
      <div
        className={cn(
          "size-2 shrink-0 rounded-full",
          gem.category === "Order" ? "bg-red-500" : "bg-blue-500"
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
      <span className="text-xs font-medium text-foreground">
        {gem.points}п
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Убрать из ядра"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function CoreCard({
  core,
  coreIndex,
  onUpdate,
  onRemove,
  onRemoveGemFromCore,
  resultAstrogems,
  showResults,
}: CoreCardProps) {
  const displayAstrogems = resultAstrogems ?? core.astrogems;
  const currentWillpower = calculateTotalWillpower(displayAstrogems);
  const currentPoints = calculateTotalPoints(displayAstrogems);
  const maxWillpower = CORE_CONFIG[core.rarity].maxWillpower;
  const breakpoints = CORE_CONFIG[core.rarity].breakpoints;
  const hitBreakpoints = getBreakpointsHit(currentPoints, core.rarity);
  const willpowerProgress = Math.min(
    (currentWillpower / maxWillpower) * 100,
    100
  );
  const isOverWillpower = currentWillpower > maxWillpower;

  function getBreakpointStatus(bp: number): "hit" | "next" | "far" {
    if (hitBreakpoints.includes(bp)) return "hit";
    const nextBp = breakpoints.find((b) => !hitBreakpoints.includes(b));
    if (bp === nextBp) return "next";
    return "far";
  }

  const coreCategory = core.type.includes("Order") ? "order" : "chaos";

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:border-primary/50">
      {/* Фоновый градиент */}
      <div
        className={cn(
          "absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10",
          coreCategory === "order"
            ? "bg-gradient-to-br from-red-500 to-orange-500"
            : "bg-gradient-to-br from-blue-500 to-cyan-500"
        )}
      />

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Изображение ядра */}
          <div className="relative shrink-0">
            <div
              className={cn(
                "relative size-16 rounded-xl border-2 p-1 shadow-md transition-all group-hover:scale-110",
                coreCategory === "order"
                  ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10"
                  : "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
              )}
            >
              <Image
                src={CORE_IMAGES[core.type]}
                alt={CORE_TYPE_LABELS[core.type]}
                width={56}
                height={56}
                className="size-full object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* Селекторы */}
          <div className="flex flex-1 flex-col gap-2">
            <Select
              value={core.type}
              onValueChange={(value: CoreType) =>
                onUpdate({ ...core, type: value, name: value })
              }
            >
              <SelectTrigger className="h-9 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CORE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CORE_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={core.rarity}
              onValueChange={(value: CoreRarity) =>
                onUpdate({ ...core, rarity: value })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RARITIES.map((r) => (
                  <SelectItem key={r} value={r}>
                    <Badge className={cn("text-xs", RARITY_COLORS[r])}>
                      {RARITY_LABELS[r]}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Кнопка удаления */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground transition-all hover:scale-110 hover:text-destructive"
            onClick={onRemove}
            aria-label="Удалить ядро"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 pt-0">
        {/* Редкость */}
        <Badge className={cn("w-fit", RARITY_COLORS[core.rarity])}>
          {RARITY_LABELS[core.rarity]}
        </Badge>

        {/* Прогресс зарядов */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Заряды ядра</span>
            <span
              className={cn(
                "text-sm font-bold",
                isOverWillpower ? "text-destructive" : "text-primary"
              )}
            >
              {currentWillpower} / {maxWillpower}
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-muted/50 shadow-inner">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 shadow-md",
                isOverWillpower
                  ? "bg-gradient-to-r from-destructive to-red-600"
                  : coreCategory === "order"
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
              )}
              style={{ width: `${willpowerProgress}%` }}
            />
          </div>
        </div>

        {/* Эффекты ядра */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Эффекты ядра
          </p>
          <div className="flex flex-wrap gap-2">
            {breakpoints.map((bp) => {
              const status = getBreakpointStatus(bp);
              return (
                <Badge
                  key={bp}
                  variant="secondary"
                  className={cn(
                    "text-xs font-semibold transition-all",
                    status === "hit" &&
                      "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30 shadow-sm",
                    status === "next" &&
                      "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse",
                    status === "far" && "opacity-40"
                  )}
                >
                  {bp}п {status === "hit" && "✓"}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Очки ядра */}
        <div className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10 px-3 py-2">
          <span className="text-sm font-medium">Очки ядра:</span>
          <span className="text-lg font-bold text-primary">{currentPoints}</span>
        </div>

        {/* Назначенные руниты */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {showResults ? "Назначено солвером" : "Текущее назначение"}
          </p>
          <CoreAstrogemsSlot
            coreIndex={coreIndex}
            coreCategory={coreCategory}
            displayAstrogems={displayAstrogems}
            showResults={showResults ?? false}
            onRemoveGemFromCore={onRemoveGemFromCore}
            onUpdate={onUpdate}
            core={core}
          />
        </div>

        {!showResults && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Слотов занято:</span>
            <Badge variant="outline" className="text-xs">
              {core.astrogems.length}/4
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
