import { useCallback, useEffect, useRef, useState } from 'react';

import { Storage } from './storage';

type StorageInit<T> = T | ((storedValue: T | undefined) => T);

type UseStorageKey = string | { key: string; instance?: Storage };

const defaultStorage = new Storage();

/**
 * A stand in for `@plasmohq/storage/hook` covering the two shapes the
 * extension uses: a plain key, or `{ key, instance }` for a specific area.
 *
 * @param rawKey The storage key, or the key plus the Storage instance to use
 * @param onInit The initial value, or a function deriving it from what's stored
 * @returns The current value and a setter which writes through to storage
 */
export const useStorage = <T = any>(
  rawKey: UseStorageKey,
  onInit?: StorageInit<T>,
): [T, (value: T) => void] => {
  const key = typeof rawKey === 'string' ? rawKey : rawKey.key;
  const instance =
    typeof rawKey === 'string' ? defaultStorage : rawKey.instance ?? defaultStorage;

  const onInitRef = useRef(onInit);
  onInitRef.current = onInit;

  const resolveInit = (stored: T | undefined): T | undefined => {
    const init = onInitRef.current;
    if (typeof init === 'function') return (init as (v: T | undefined) => T)(stored);
    if (stored !== undefined) return stored;
    return init;
  };

  const [value, setValue] = useState<T | undefined>(() => resolveInit(undefined));

  useEffect(() => {
    let mounted = true;

    instance.get<T>(key).then((stored) => {
      if (!mounted) return;
      const resolved = resolveInit(stored);
      setValue(resolved);
      // * persist whatever we defaulted to, so the rest of the extension agrees
      if (stored === undefined && resolved !== undefined) {
        instance.set(key, resolved);
      }
    });

    const onChange = ({ newValue }: { newValue: T | undefined }) => {
      if (mounted) setValue(newValue);
    };

    instance.watch({ [key]: onChange });

    return () => {
      mounted = false;
      instance.unwatch({ [key]: onChange });
    };
  }, [key, instance]);

  const setStoredValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      instance.set(key, newValue);
    },
    [key, instance],
  );

  return [value as T, setStoredValue];
};

export default useStorage;
