import { EntityBase } from '../entity/EntityBase';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';

export class IndexedDBProvider implements IOfflineStorageProvider {
    private dbPromise: Promise<IDBDatabase> | null = null;
    private storageName!: string;
    private version: number;

    constructor(version: number = 1) {
        this.version = version;
    }
    addModel<T extends EntityBase>(label: string, model: any): void {
        throw new Error('No need to add models to IndexedDB provider');
    }

    async init(storageName: string): Promise<void> {
        this.storageName = storageName;
        this.dbPromise = this.openDatabase();
        await this.dbPromise; // Ensure db is open before proceeding
    }

    private openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.storageName, this.version);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('data')) {
                    db.createObjectStore('data', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    private async getObjectStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
        const db = await this.dbPromise;
        const transaction = db!.transaction('data', mode);
        return transaction.objectStore('data');
    }

    async save(): Promise<void> {
        // IndexedDB handles saving automatically.
    }

    async update<T extends EntityBase>(label: string, item: T): Promise<void> {
        const store = await this.getObjectStore('readwrite');
        const data = await store.get(item.id);
        if (data) {
            await store.put(item);
        } else {
            await store.add(item);
        }
    }

    async delete<T extends EntityBase>(label: string, item: T): Promise<void> {
        const store = await this.getObjectStore('readwrite');
        await store.delete(item.id);
    }

    async findById<T extends EntityBase>(label: string, uuid: string): Promise<T | undefined> {
        const store = await this.getObjectStore('readonly');
        return new Promise<T | undefined>((resolve, reject) => {
            const request = store.get(uuid);
            request.onsuccess = () => {
                resolve(request.result as T | undefined);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async find<T extends EntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<Array<Pick<T, K>>> {
        const store = await this.getObjectStore('readonly');
        const allItems: T[] = await new Promise<T[]>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result as T[]);
            request.onerror = () => reject(request.error);
        });
        const filteredItems = allItems.filter(query);

        if (pickKeys) {
            return filteredItems.map((item) => {
                const result: Pick<T, K> = {} as Pick<T, K>;
                pickKeys.forEach((key) => {
                    if (key in item) {
                        result[key] = item[key];
                    }
                });
                return result;
            });
        } else {
            return filteredItems;
        }
    }

    async all<T extends EntityBase>(label: string): Promise<Array<T>> {
        const store = await this.getObjectStore('readonly');
        return new Promise<Array<T>>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result as Array<T>);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getModels(): Promise<Map<string, any>> {
        return Promise.resolve(new Map()); // IndexedDB does not use in-memory models
    }
}