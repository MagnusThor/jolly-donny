/**
 * Serializes a Uint8Array to a JSON string and stores it in the browser's localStorage.
 *
 * @param data - The Uint8Array to be serialized and stored.
 * @param key - The key under which the serialized data will be stored in localStorage.
 */
export function serializeToStorage(data: Uint8Array, key: string) {
    localStorage.setItem(key, JSON.stringify(Array.from(data)));
  }
  
/**
 * Loads a value from the browser's local storage and converts it into a `Uint8Array`.
 *
 * @param key - The key used to retrieve the stored value from local storage.
 * @returns A `Uint8Array` representation of the stored value if it exists, or `null` if the key is not found.
 */
  export function loadFromStorage(key: string): Uint8Array | null {
    const json = localStorage.getItem(key);
    return json ? new Uint8Array(JSON.parse(json)) : null;
  }