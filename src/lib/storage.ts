/**
 * Safe, client-only localStorage access.
 *
 * Every read/write is guarded so that (a) server rendering never touches
 * `window`, and (b) a full / disabled / corrupted storage never crashes the UI.
 * Writes broadcast a custom event so every provider in the same tab (and,
 * through the native `storage` event, other tabs) can refresh its state.
 */

export const STORAGE_PREFIX = "alam_fashion:v1:";

export const STORAGE_KEYS = {
  products: "products",
  categories: "categories",
  orders: "orders",
  orderCounter: "order-counter",
  cart: "cart",
  wishlist: "wishlist",
  coupon: "coupon",
  profile: "profile",
  addresses: "addresses",
  checkoutInfo: "checkout-info",
  reviews: "reviews",
  newsletter: "newsletter",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const CHANGE_EVENT = "alam_fashion:storage";

const isBrowser = () => typeof window !== "undefined";

export function emitStorageChange(key: string): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
}

export function readJSON<T>(key: StorageKey, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function hasKey(key: StorageKey): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key) !== null;
  } catch {
    return false;
  }
}

/** Returns false if the value could not be persisted (e.g. quota exceeded). */
export function writeJSON<T>(
  key: StorageKey,
  value: T,
  options: { silent?: boolean } = {},
): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    return false;
  }
  if (!options.silent) {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
  }
  return true;
}

export function removeKey(key: StorageKey): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
}

/** Subscribe to changes of the given keys (same tab and other tabs). */
export function subscribeToStorage(
  keys: readonly string[],
  callback: () => void,
): () => void {
  if (!isBrowser()) return () => undefined;

  const onCustom = (event: Event) => {
    const key = (event as CustomEvent<{ key: string }>).detail?.key;
    if (!key || keys.includes(key)) callback();
  };
  const onNative = (event: StorageEvent) => {
    if (event.key === null) return callback();
    if (!event.key.startsWith(STORAGE_PREFIX)) return;
    const key = event.key.slice(STORAGE_PREFIX.length);
    if (keys.includes(key)) callback();
  };

  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onNative);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onNative);
  };
}

/* ------------------------------ sessionStorage --------------------------- */

export function readSession<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeSession<T>(key: string, value: T | null): void {
  if (!isBrowser()) return;
  try {
    if (value === null) window.sessionStorage.removeItem(STORAGE_PREFIX + key);
    else window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(CHANGE_EVENT, { detail: { key: `session:${key}` } }),
  );
}
