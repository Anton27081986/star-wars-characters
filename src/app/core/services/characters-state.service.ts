import { Injectable, signal, effect } from '@angular/core';
import { Person } from '../models/person_model';

export interface CharacterOverride {
  name?: string;
  height?: string;
  mass?: string;
  gender?: string;
  birth_year?: string;
}

type OverridesMap = Record<string, CharacterOverride>;

const STORAGE_KEY = 'sw-characters-overrides';

@Injectable({
  providedIn: 'root',
})
export class CharactersStateService {
  private overridesSig = signal<OverridesMap>({});

  constructor() {
    this.loadFromStorage();

    effect(() => {
      const current = this.overridesSig();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    });
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.overridesSig.set(JSON.parse(raw));
      }
    } catch {
      this.overridesSig.set({});
    }
  }

  public withOverrides(id: string, person: Person): Person {
    const override = this.overridesSig()[id];
    if (!override) return person;
    return { ...person, ...override };
  }

  public updateCharacter(id: string, data: CharacterOverride): void {
    this.overridesSig.update((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...data,
      },
    }));
  }
}
