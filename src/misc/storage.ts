import { browser } from 'wxt/browser';

export type StorageArea = 'sync' | 'local' | 'session' | 'managed';

export type StorageWatchEvent<T = any> = {
  newValue: T | undefined;
  oldValue: T | undefined;
};

export type StorageWatchCallback<T = any> = (
  event: StorageWatchEvent<T>,
  area: string,
) => void;

export type StorageCallbackMap = Record<string, StorageWatchCallback>;

/**
 * A small stand in for `@plasmohq/storage`.
 *
 * It deliberately keeps Plasmo's two conventions - JSON serialised values and
 * the `sync` area by default - so everyone's existing settings are still
 * readable after the move to WXT.
 */
export class Storage {
  readonly area: StorageArea;

  private listeners = new Map<
    string,
    {
      callbacks: Set<StorageWatchCallback>;
      listener: (changes: Record<string, any>, area: string) => void;
    }
  >();

  constructor({ area = 'sync' }: { area?: StorageArea } = {}) {
    this.area = area;
  }

  private get client() {
    return browser.storage[this.area];
  }

  // eslint-disable-next-line class-methods-use-this
  private parse<T>(value: unknown): T | undefined {
    if (value === undefined || value === null) return undefined;
    // * anything that isn't a string was written by something other than us
    if (typeof value !== 'string') return value as T;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error('Could not parse stored value', value, e);
      return undefined;
    }
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    const result = await this.client.get(key);
    return this.parse<T>(result?.[key]);
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    await this.client.set({ [key]: JSON.stringify(value) });
  }

  async remove(key: string): Promise<void> {
    await this.client.remove(key);
  }

  watch(callbackMap: StorageCallbackMap): boolean {
    Object.entries(callbackMap).forEach(([key, callback]) => {
      const existing = this.listeners.get(key);

      if (existing) {
        existing.callbacks.add(callback);
        return;
      }

      const callbacks = new Set([callback]);
      const listener = (changes: Record<string, any>, area: string) => {
        if (area !== this.area || !changes[key]) return;
        const event: StorageWatchEvent = {
          newValue: this.parse(changes[key].newValue),
          oldValue: this.parse(changes[key].oldValue),
        };
        callbacks.forEach((cb) => cb(event, area));
      };

      browser.storage.onChanged.addListener(listener);
      this.listeners.set(key, { callbacks, listener });
    });

    return true;
  }

  unwatch(callbackMap: StorageCallbackMap): boolean {
    Object.entries(callbackMap).forEach(([key, callback]) => {
      const entry = this.listeners.get(key);
      if (!entry) return;

      entry.callbacks.delete(callback);
      if (entry.callbacks.size > 0) return;

      browser.storage.onChanged.removeListener(entry.listener);
      this.listeners.delete(key);
    });

    return true;
  }

  unwatchAll(): void {
    this.listeners.forEach(({ listener }) =>
      browser.storage.onChanged.removeListener(listener),
    );
    this.listeners.clear();
  }
}

export default Storage;
