import type { Core, Astrogem } from "@/lib/arkgrid";
import { generateId } from "@/lib/arkgrid";
import type { CoreType } from "@/lib/arkgrid";

export const STORAGE_KEY_CHARACTERS = "arkgrid-characters";
export const STORAGE_KEY_ACTIVE = "arkgrid-active-character";

export interface Character {
  id: string;
  name: string;
  cores: Core[];
  astrogems: Astrogem[];
}

export const CORE_TYPES: CoreType[] = [
  "Order of the Sun",
  "Order of the Moon",
  "Order of the Star",
  "Chaos of the Sun",
  "Chaos of the Moon",
  "Chaos of the Star",
];

export function createDefaultCharacter(name = "Персонаж 1"): Character {
  return {
    id: generateId(),
    name,
    cores: [],
    astrogems: [],
  };
}
