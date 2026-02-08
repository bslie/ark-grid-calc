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

interface DeleteCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string;
  onConfirm: () => void;
}

export function DeleteCharacterDialog({
  open,
  onOpenChange,
  characterName,
  onConfirm,
}: DeleteCharacterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить персонажа?</DialogTitle>
          <DialogDescription>
            Персонаж «{characterName}» и все его ядра и руниты будут удалены.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
