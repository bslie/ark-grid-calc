"use client";

import { useState } from "react";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
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
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showAssignedInfo, setShowAssignedInfo] = useState(false);
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
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-md hover:border-border/80",
        assignedTo
          ? "border-emerald-500/50 bg-emerald-500/5 shadow-sm"
          : "border-border/80",
        !isComplete && "border-dashed border-muted-foreground/30",
        isDragging && "opacity-60 shadow-lg ring-2 ring-primary/20 z-50"
      )}
    >
      {/* Акцентная полоска по категории */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
          astrogem.category === "Order"
            ? "bg-gradient-to-b from-red-500/60 to-orange-500/60"
            : "bg-gradient-to-b from-blue-500/60 to-cyan-500/60"
        )}
      />

      <div className="relative flex flex-col gap-3 pl-4 pr-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-2.5">
        {/* Блок: иконка + категория (фиксированная ширина на sm+ для выравнивания с заголовками колонок) */}
        <div className="flex min-w-0 items-center gap-3 sm:w-40 sm:flex-none sm:shrink-0">
          <div
            {...listeners}
            {...attributes}
            className={cn(
              "relative size-11 shrink-0 cursor-grab active:cursor-grabbing rounded-lg border p-1 transition-all touch-none",
              "hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring",
              astrogem.category === "Order"
                ? "border-red-500/25 bg-red-500/10"
                : "border-blue-500/25 bg-blue-500/10"
            )}
            role="button"
            aria-label="Перетащить рунит"
          >
            <Image
              src={getAstrogemImage()}
              alt={CATEGORY_LABELS[astrogem.category]}
              width={36}
              height={36}
              className="size-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 sm:flex-none">
            <Select
              value={astrogem.category}
              onValueChange={(value: "Order" | "Chaos") =>
                onUpdate({ ...astrogem, category: value })
              }
            >
              <SelectTrigger className="h-9 w-full border-0 bg-transparent px-2 font-semibold shadow-none focus:ring-2 sm:w-auto sm:min-w-[100px]">
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
              <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="truncate">Назначен: {assignedTo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Блок: заряды + очки + удалить — одна линия */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground sm:sr-only">
              <Zap className="size-3.5" />
              Заряды
            </label>
            <Input
              type="number"
              min={0}
              max={20}
              placeholder="0"
              className={cn(
                "h-9 w-20 text-center font-medium tabular-nums sm:w-14",
                "border-border/80 bg-background/50",
                astrogem.willpower != null && astrogem.willpower > 0 && "border-primary/40 bg-primary/5"
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
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground sm:sr-only">
              <Target className="size-3.5" />
              Очки
            </label>
            <Input
              type="number"
              min={0}
              max={20}
              placeholder="0"
              className={cn(
                "h-9 w-20 text-center font-medium tabular-nums sm:w-14",
                "border-border/80 bg-background/50",
                astrogem.points != null && astrogem.points > 0 && "border-primary/40 bg-primary/5"
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
            className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() =>
              assignedTo ? setShowAssignedInfo(true) : setShowRemoveConfirm(true)
            }
            aria-label="Удалить камень"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={showAssignedInfo}
        onOpenChange={setShowAssignedInfo}
        title="Сначала отвяжите рунит от ядра"
        description={
          assignedTo
            ? `Этот рунит назначен на ядро «${assignedTo}». Уберите его из ядра (кнопка в карточке ядра), затем удалите из коллекции.`
            : ""
        }
        infoOnly
      />
      <ConfirmDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        title="Удалить рунит?"
        description="Рунит будет удалён из коллекции. Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={onRemove}
      />
    </div>
  );
}
