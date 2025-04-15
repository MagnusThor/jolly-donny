import { PersistedEntityBase } from '../entity/PersistedEntityBase';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';
import { IProviderConfig } from '../interface/IProviderConfig';
import { QueryableArray } from '../utils/QueryableArray';

export class IndexedDBProvider implements IOfflineStorageProvider {
    private dbPromise: Promise<IDBDatabase> | null = null;
    private storageName!: string;
    private version: number;

    constructor(version: number = 1) {
        this.version = version;
    }
    ['constructor'](config?: IProviderConfig): IOfflineStorageProvider {
        throw new Error('Method not implemented.');
    }
    /**
     * Adds a collection to the IndexedDB provider.
     * 
     * @template T - The type of the entities in the collection, extending `PersistedEntityBase`.
     * @param label - The label or name of the collection.
     * @param collection - The collection to be added.
     * 
     * @throws {Error} This method is not implemented for the IndexedDB provider, as collections
     * are not manually added in this context.
     */
    addCollection<T extends PersistedEntityBase>(label: string, collection: any): void {
        throw new Error('No need to add collections to IndexedDB provider');
    }

    /**
     * Initializes the IndexDBProvider by setting the storage name and opening the database.
     * Ensures the database is open before proceeding with any operations.
     *
     * @param storageName - The name of the storage to initialize.
     * @returns A promise that resolves when the database is successfully opened.
     */
    async init(storageName: string): Promise<void> {
        this.storageName = storageName;
        this.dbPromise = this.openDatabase();
        await this.dbPromise; // Ensure db is open before proceeding
    }

    /**
     * Opens an IndexedDB database with the specified storage name and version.
     * If the database does not exist or requires an upgrade, the `onupgradeneeded` event
     * will be triggered to create or update the object stores.
     *
     * @returns {Promise<IDBDatabase>} A promise that resolves with the opened `IDBDatabase` instance
     * or rejects with an error if the operation fails.
     *
     * @throws {DOMException} If an error occurs while opening the database.
     */
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

    /**
     * Retrieves an object store from the IndexedDB database with the specified transaction mode.
     * 
     * @param mode - The transaction mode to use when accessing the object store. 
     *               It can be "readonly", "readwrite", or "versionchange".
     * @returns A promise that resolves to the `IDBObjectStore` for the 'data' store.
     * 
     * @throws Will throw an error if the database connection (`dbPromise`) is not established.
     */
    private async getObjectStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
        const db = await this.dbPromise;
        const transaction = db!.transaction('data', mode);
        return transaction.objectStore('data');
    }

    /**
     * Saves data to the IndexedDB storage.
     * 
     * Note: IndexedDB automatically handles the saving process, 
     * so this method does not require any additional implementation.
     * 
     * @returns A promise that resolves when the save operation is complete.
     */
    async save(): Promise<void> {
        // IndexedDB handles saving automatically.
    }

    /**
     * Updates an existing entity in the IndexedDB object store or adds it if it does not exist.
     *
     * @template T - The type of the entity, extending `PersistedEntityBase`.
     * @param label - A string label associated with the entity (not used in the current implementation).
     * @param item - The entity to be updated or added. Must have a unique `id` property.
     * @returns A promise that resolves when the operation is complete.
     * @throws Will throw an error if the object store cannot be accessed or the operation fails.
     */
    async update<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const store = await this.getObjectStore('readwrite');
        const data = await store.get(item.id!);
        if (data) {
            await store.put(item);
        } else {
            await store.add(item);
        }
    }

    /**
     * Deletes an entity from the IndexedDB object store.
     *
     * @template T - The type of the entity to be deleted, extending `PersistedEntityBase`.
     * @param label - A label or identifier for the operation (not used in the current implementation).
     * @param item - The entity to be deleted, which must include a defined `id` property.
     * @returns A promise that resolves when the deletion is complete.
     * @throws Will throw an error if the object store cannot be accessed or the deletion fails.
     */
    async delete<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const store = await this.getObjectStore('readwrite');
        await store.delete(item.id!);
    }

    /**
     * Retrieves an entity of type `T` from the IndexedDB object store by its ID.
     *
     * @template T - The type of the entity to retrieve, which must extend `PersistedEntityBase`.
     * @param label - A label or identifier for the entity type (not used in the current implementation).
     * @param id - The unique identifier of the entity to retrieve. Can be a number or a string.
     * @returns A promise that resolves to the entity of type `T` if found, or `undefined` if not found.
     * @throws An error if the IndexedDB request fails.
     */
    async findById<T extends PersistedEntityBase>(label: string, id: number | string): Promise<T | undefined> {
        const store = await this.getObjectStore('readonly');
        return new Promise<T | undefined>((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => {
                resolve(request.result as T | undefined);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Finds and retrieves items from an IndexedDB object store based on a query function.
     * Optionally, specific keys can be picked from the matched items.
     *
     * @template T - The type of the persisted entity.
     * @template K - The keys of the entity to pick (defaults to all keys of T).
     * 
     * @param label - A label or identifier for the operation (not used in the current implementation).
     * @param query - A function that determines whether an item matches the search criteria.
     * @param pickKeys - An optional array of keys to pick from the matched items. If not provided, the entire item is returned.
     * 
     * @returns A promise that resolves to an array of items matching the query. If `pickKeys` is provided, 
     *          the items will only include the specified keys.
     * 
     * @throws Will throw an error if there is an issue accessing the IndexedDB object store.
     */
    async find<T extends PersistedEntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<QueryableArray<Pick<T, K>>> {
        const store = await this.getObjectStore('readonly');
        const allItems: T[] = await new Promise<T[]>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result as T[]);
            request.onerror = () => reject(request.error);
        });
        const filteredItems = allItems.filter(query);

        if (pickKeys) {
            const pickedItems = filteredItems.map((item) => {
                const result: Pick<T, K> = {} as Pick<T, K>;
                pickKeys.forEach((key) => {
                    if (key in item) {
                        result[key] = item[key];
                    }
                });
                return result;
            });
            return new QueryableArray<Pick<T, K>>(...pickedItems);
        } else {
            return new QueryableArray<Pick<T, K>>(...filteredItems);
        }
    }

    

    /**
     * Retrieves all entities of a specified type from the IndexedDB object store.
     *
     * @template T - The type of the entities to retrieve, extending `PersistedEntityBase`.
     * @param label - A string label used to identify the type of entities (not used in the current implementation).
     * @returns A promise that resolves to an array of entities of type `T`.
     * @throws An error if the retrieval operation fails.
     */
    async all<T extends PersistedEntityBase>(label: string): Promise<QueryableArray<T>> {
        const store = await this.getObjectStore('readonly');
        const items = await new Promise<T[]>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result as T[]);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
        return new QueryableArray<T>(...items);
    }

    /**
     * Retrieves all collections from the storage provider.
     * 
     * @returns {Promise<Map<string, any>>} A promise that resolves to a map of collections.
     * 
     * @remarks
     * This implementation returns an empty map because IndexedDB does not natively support 
     * retrieving collections in the same way as LocalStorage.
     */
    async getCollections(): Promise<Map<string, any>> {
        return Promise.resolve(new Map()); // IndexedDB does not support getting collections like LocalStorage
    }
}