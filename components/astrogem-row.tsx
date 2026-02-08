"use client";

import type { Astrogem } from "@/lib/arkgrid";
import { CATEGORY_LABELS } from "@/lib/arkgrid";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Trash2, Zap, Target } from "lucide-react";
import Image from "next/image";

const CATEGORIES = ["Order", "Chaos"] as const;

const ASTROGEM_IMAGES: Record<string, string> = {
  "Order-solidity": "/images/astrogems/order-solidity.png",
  "Order-stability": "/images/astrogems/order-stability.png",
  "Order-immutability": "/images/astrogems/order-immutability.png",
  "Chaos-destruction": "/images/astrogems/chaos-destruction.png",
  "Chaos-corrosion": "/images/astrogems/chaos-corrosion.png",
  "Chaos-distortion": "/images/astrogems/chaos-distortion.png",
};

interface AstrogemRowProps {
  astrogem: Astrogem;
  onUpdate: (astrogem: Astrogem) => void;
  onRemove: () => void;
  assignedTo?: string;
}

export function AstrogemRow({ astrogem, onUpdate, onRemove, assignedTo }: AstrogemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `astrogem-${astrogem.id}`,
    data: { astrogem },
  });
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  // Выбираем случайную иконку для категории
  const getAstrogemImage = () => {
    const categoryImages = Object.entries(ASTROGEM_IMAGES)
      .filter(([key]) => key.startsWith(astrogem.category))
      .map(([, value]) => value);
    return categoryImages[0] || "/images/astrogems/order-solidity.png";
  };

  const isComplete = astrogem.willpower != null && astrogem.points != null && 
                     astrogem.willpower > 0 && astrogem.points > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 p-3 transition-all duration-300 hover:shadow-lg",
        assignedTo
          ? "border-green-500/40 bg-gradient-to-r from-green-500/10 to-green-500/5 shadow-sm"
          : "border-border bg-card hover:border-primary/30",
        !isComplete && "border-dashed",
        isDragging && "opacity-50 shadow-xl z-50"
      )}
    >
      {/* Фоновый градиент */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5",
          astrogem.category === "Order"
            ? "bg-gradient-to-r from-red-500 to-orange-500"
            : "bg-gradient-to-r from-blue-500 to-cyan-500"
        )}
      />

      {/* На мобильных — две строки: [иконка+категория] и [заряды+очки+удалить]; на десктопе — одна строка */}
      <div className="relative flex flex-col gap-3 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_90px_90px_auto] sm:items-center sm:gap-3">
        {/* Верхняя строка на мобильных: иконка + категория */}
        <div className="flex min-w-0 items-start gap-3 sm:contents">
          <div
            {...listeners}
            {...attributes}
            className={cn(
              "relative size-12 shrink-0 cursor-grab active:cursor-grabbing rounded-lg border-2 p-1 shadow-sm transition-all group-hover:scale-110 touch-none",
              astrogem.category === "Order"
                ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10"
                : "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
            )}
            role="button"
            aria-label="Перетащить рунит"
          >
            <Image
              src={getAstrogemImage()}
              alt={CATEGORY_LABELS[astrogem.category]}
              width={40}
              height={40}
              className="size-full object-contain drop-shadow-md"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-0">
            <Select
              value={astrogem.category}
              onValueChange={(value: "Order" | "Chaos") =>
                onUpdate({ ...astrogem, category: value })
              }
            >
              <SelectTrigger className="h-9 border-0 bg-transparent px-2 font-semibold shadow-none focus:ring-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span
                      className={cn(
                        "font-semibold",
                        c === "Order" && "text-red-600 dark:text-red-400",
                        c === "Chaos" && "text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {CATEGORY_LABELS[c]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {assignedTo && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <div className="size-1.5 shrink-0 rounded-full bg-green-500 animate-pulse" />
                <span className="truncate">Назначен: {assignedTo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Нижняя строка на мобильных: заряды + очки + удалить */}
        <div className="flex items-end gap-2 sm:contents">
          <div className="flex-1 space-y-1 sm:flex-none">
            <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Zap className="size-3 shrink-0" />
              Заряды
            </label>
            <Input
              type="number"
              min={0}
              max={20}
              placeholder="—"
              className={cn(
                "h-9 w-full text-center font-semibold transition-all sm:w-[90px]",
                astrogem.willpower && "ring-2 ring-primary/20"
              )}
              value={astrogem.willpower ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                const num = v === "" ? null : parseInt(v, 10);
                onUpdate({
                  ...astrogem,
                  willpower: num === null || isNaN(num) ? null : num,
                });
              }}
              aria-label="Заряды"
            />
          </div>
          <div className="flex-1 space-y-1 sm:flex-none">
            <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Target className="size-3 shrink-0" />
              Очки
            </label>
            <Input
              type="number"
              min={0}
              max={20}
              placeholder="—"
              className={cn(
                "h-9 w-full text-center font-semibold transition-all sm:w-[90px]",
                astrogem.points && "ring-2 ring-primary/20"
              )}
              value={astrogem.points ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                const num = v === "" ? null : parseInt(v, 10);
                onUpdate({
                  ...astrogem,
                  points: num === null || isNaN(num) ? null : num,
                });
              }}
              aria-label="Очки ядра"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 self-end text-muted-foreground transition-all hover:scale-110 hover:text-destructive sm:self-center"
            onClick={onRemove}
            aria-label="Удалить камень"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
