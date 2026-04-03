import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Card, CardFormData } from "@/types/card";

interface CardStore {
  cards: Card[];
  initialized: boolean;
  addCard: (data: CardFormData) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  updateCard: (id: string, data: Partial<CardFormData>) => Promise<void>;
  getCardById: (id: string) => Card | undefined;
  initializeStore: () => Promise<void>;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const STORAGE_KEY = "loyalty_cards_store";
let memoryStore: string | null = null;

const readCardsFromStorage = async (): Promise<string | null> => {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      memoryStore = stored;
      return stored;
    }
  }

  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (stored !== null) {
      memoryStore = stored;
    }
    return stored ?? memoryStore;
  } catch (error) {
    console.error("Failed to read cards from storage:", error);
    return memoryStore;
  }
};

const writeCardsToStorage = async (cards: Card[]): Promise<void> => {
  const serialized = JSON.stringify(cards);
  memoryStore = serialized;

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, serialized);
    return;
  }

  try {
    await SecureStore.setItemAsync(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to persist cards to storage:", error);
  }
};

export const useCards = create<CardStore>((set, get) => ({
  cards: [],
  initialized: false,

  initializeStore: async () => {
    try {
      const stored = await readCardsFromStorage();
      if (stored) {
        const cards = JSON.parse(stored);
        set({ cards, initialized: true });
      } else {
        set({ cards: [], initialized: true });
      }
    } catch (error) {
      console.error("Failed to initialize store:", error);
      set({ initialized: true });
    }
  },

  addCard: async (data: CardFormData) => {
    const newCard: Card = {
      id: generateId(),
      ...data,
      createdAt: Date.now(),
    };

    const updated = [...get().cards, newCard];
    set({ cards: updated });

    await writeCardsToStorage(updated);
  },

  removeCard: async (id: string) => {
    const updated = get().cards.filter((card) => card.id !== id);
    set({ cards: updated });

    await writeCardsToStorage(updated);
  },

  updateCard: async (id: string, data: Partial<CardFormData>) => {
    const updated = get().cards.map((card) =>
      card.id === id ? { ...card, ...data } : card,
    );
    set({ cards: updated });

    await writeCardsToStorage(updated);
  },

  getCardById: (id: string) => {
    return get().cards.find((card) => card.id === id);
  },
}));
