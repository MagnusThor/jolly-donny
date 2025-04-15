/**
 * A utility class for managing `Uint8Array` data in the browser's `localStorage`.
 * Provides methods to save, load, clear, and check the existence of data stored
 * under specific keys in `localStorage`.
 *
 * Methods:
 * - `save(data: Uint8Array, key: string): void`  
 *   Serializes a `Uint8Array` to JSON and stores it in `localStorage` under the specified key.
 *
 * - `load(key: string): Uint8Array | null`  
 *   Retrieves and deserializes a `Uint8Array` from `localStorage` using the specified key.
 *   Returns `null` if the key does not exist or if parsing fails.
 *
 * - `clear(key: string): void`  
 *   Removes the data associated with the specified key from `localStorage`.
 *
 * - `exists(key: string): boolean`  
 *   Checks whether data exists in `localStorage` under the specified key.
 */
export class SQLiteLocalStorage {
  /**
   * Serializes a Uint8Array to JSON and stores it in localStorage.
   * @param data - The data to store.
   * @param key - The localStorage key.
   */
  static save(data: Uint8Array, key: string) {
    try {
      const json = JSON.stringify(Array.from(data));
      localStorage.setItem(key, json);
    } catch (err) {
      console.warn("Failed to save to localStorage", err);
    }
  }

  /**
   * Loads a Uint8Array from localStorage.
   * @param key - The localStorage key to load from.
   * @returns The loaded Uint8Array or null if not found or failed to parse.
   */
  static load(key: string): Uint8Array | null {
    try {
      const json = localStorage.getItem(key);
      return json ? new Uint8Array(JSON.parse(json)) : null;
    } catch (err) {
      console.warn("Failed to load from localStorage", err);
      return null;
    }
  }

  /**
   * Clears a key from localStorage.
   * @param key - The key to remove.
   */
  static clear(key: string) {
    localStorage.removeItem(key);
  }

  /**
   * Checks if data exists under a given key.
   * @param key - The key to check.
   */
  static exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}



export class SQLiteFileHandler {
  private static fileHandle: FileSystemFileHandle | null = null;

  /**
   * Serializes a Uint8Array to a JSON string and stores it in localStorage.
   */
  static serializeToStorage(data: Uint8Array, key: string) {
    localStorage.setItem(key, JSON.stringify(Array.from(data)));
  }

  /**
   * Loads a Uint8Array from localStorage, if it exists.
   */
  static loadFromStorage(key: string): Uint8Array | null {
    const json = localStorage.getItem(key);
    return json ? new Uint8Array(JSON.parse(json)) : null;
  }

  /**
   * Prompts the user to select a `.sqlite` file and reads it into a Uint8Array.
   * Stores the file handle internally for future saves.
   */
  static async loadFromFileSystem(): Promise<Uint8Array | null> {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{ description: "SQLite Files", accept: { "application/octet-stream": [".sqlite"] } }],
      });

      this.fileHandle = handle;
      const file = await handle.getFile();
      const buffer = await file.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (err) {
      console.warn("File open cancelled or failed", err);
      return null;
    }
  }

  /**
   * Saves the given data to the previously opened file.
   * If no file was opened, prompts the user to pick a file.
   */
  static async saveToFileSystem(data: Uint8Array, fallbackName = "database.sqlite") {
    try {
      if (!this.fileHandle) {
        this.fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: fallbackName,
          types: [{ description: "SQLite Files", accept: { "application/octet-stream": [".sqlite"] } }],
        });
      }

      const writable = await this.fileHandle!.createWritable();
      await writable.write(data);
      await writable.close();
    } catch (err) {
      console.warn("File save cancelled or failed", err);
    }
  }

  /**
   * Clears the stored file handle — useful for 'Save As' or restarting the workflow.
   */
  static clearFileHandle() {
    this.fileHandle = null;
  }

  /**
   * Returns true if a file handle is available for saving without prompt.
   */
  static hasFileHandle(): boolean {
    return this.fileHandle !== null;
  }
}
