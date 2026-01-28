import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Start with a server-safe value; hydrate from localStorage once the client mounts.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on first client render.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        // Seed storage so a refresh keeps the new value after first change.
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error('Failed to read localStorage', error);
      setStoredValue(initialValue);
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Wrapped setter persists to localStorage when available.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Failed to write localStorage', error);
    }
  };

  return [hydrated ? storedValue : initialValue, setValue] as const;
}
