"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { AstrogemCategory } from "@/lib/arkgrid";

interface AddGemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: AstrogemCategory) => void;
  children: React.ReactNode;
}

export function AddGemDialog({
  open,
  onOpenChange,
  onAdd,
  children,
}: AddGemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Новый рунит</DialogTitle>
          <DialogDescription>
            Выберите категорию камня (Порядок или Хаос).
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 py-6">
          <Button
            variant="outline"
            className="flex-1 h-24 border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 transition-all"
            onClick={() => onAdd("Order")}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative size-10 shrink-0 rounded-lg border-2 border-red-500/30 overflow-hidden bg-red-500/10 p-0.5">
                <Image
                  src="/images/astrogems/order-solidity.png"
                  alt="Порядок"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="font-semibold text-red-600 dark:text-red-400">
                Порядок
              </span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-24 border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all"
            onClick={() => onAdd("Chaos")}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative size-10 shrink-0 rounded-lg border-2 border-blue-500/30 overflow-hidden bg-blue-500/10 p-0.5">
                <Image
                  src="/images/astrogems/chaos-destruction.png"
                  alt="Хаос"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Хаос
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
