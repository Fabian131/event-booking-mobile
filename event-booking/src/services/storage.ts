const store: Record<string, string> = {};

export const storage = {
  set(key: string, value: string) {
    store[key] = value;
  },

  get(key: string): string | null {
    return store[key] ?? null;
  },

  remove(key: string) {
    delete store[key];
  },

  clear() {
    Object.keys(store).forEach((key) => delete store[key]);
  },
};
