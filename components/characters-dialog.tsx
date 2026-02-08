"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, ChevronDown } from "lucide-react";
import type { Character } from "@/lib/character";

interface CharactersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characters: Character[];
  activeCharacterId: string;
  onSelectCharacter: (id: string) => void;
  newCharacterName: string;
  onNewCharacterNameChange: (name: string) => void;
  onAddCharacter: () => void;
  canDelete: boolean;
  onRequestDelete: () => void;
  children: React.ReactNode;
}

export function CharactersDialog({
  open,
  onOpenChange,
  characters,
  activeCharacterId,
  onSelectCharacter,
  newCharacterName,
  onNewCharacterNameChange,
  onAddCharacter,
  canDelete,
  onRequestDelete,
  children,
}: CharactersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Персонажи</DialogTitle>
          <DialogDescription>
            Переключение между персонажами. У каждого свой набор ядер и рунитов.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {characters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelectCharacter(c.id);
                onOpenChange(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                c.id === activeCharacterId
                  ? "border-primary bg-primary/10"
                  : "hover:bg-muted/50"
              )}
            >
              {c.name}
              {c.id === activeCharacterId && (
                <Badge variant="secondary">Активный</Badge>
              )}
            </button>
          ))}
        </div>
        <DialogFooter>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Имя нового персонажа"
              value={newCharacterName}
              onChange={(e) => onNewCharacterNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddCharacter()}
              className="sm:flex-1"
            />
            <Button onClick={onAddCharacter}>Добавить</Button>
          </div>
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onRequestDelete}
            >
              Удалить текущего
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
