"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Режим «только информация»: одна кнопка «Понятно», без подтверждения действия */
  infoOnly?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  infoOnly = false,
  confirmLabel = "Удалить",
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {infoOnly ? (
            <Button onClick={() => onOpenChange(false)}>Понятно</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                {confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
