import { PersistedEntityBase } from '../entity/PersistedEntityBase';
import { QueryableArray } from '../utils/QueryableArray';
import { IProviderConfig } from './IProviderConfig';

/**
 * Interface representing an offline storage provider.
 * This interface defines methods for initializing, saving, updating, deleting,
 * and querying data in an offline storage system.
 */
export interface IOfflineStorageProvider {
    /**
     * Initializes the storage provider with a given storage name.
     * @param storageName - The name of the storage to initialize.
     * @returns A promise that resolves when the initialization is complete.
     */
    init(storageName: string): Promise<void>;

    /**
     * Saves the current state of the storage.
     * @returns A promise that resolves when the save operation is complete.
     */
    save(): Promise<void>;

    /**
     * Updates an item in the storage.
     * @param label - The label or collection name where the item is stored.
     * @param item - The item to update, extending the `PersistedEntityBase` type.
     * @returns A promise that resolves when the update operation is complete.
     */
    update<T extends PersistedEntityBase>(label: string, item: T): Promise<void>;

    /**
     * Deletes an item from the storage.
     * @param label - The label or collection name where the item is stored.
     * @param item - The item to delete, extending the `PersistedEntityBase` type.
     * @returns A promise that resolves when the delete operation is complete.
     */
    delete<T extends PersistedEntityBase>(label: string, item: T): Promise<void>;

    /**
     * Finds an item in the storage by its unique identifier.
     * @param label - The label or collection name where the item is stored.
     * @param id - The unique identifier of the item to find.
     * @returns A promise that resolves with the found item or `undefined` if not found.
     */
    findById<T extends PersistedEntityBase>(label: string, id: string | number): Promise<T | undefined>;

    /**
     * Finds items in the storage that match a given query.
     * Optionally, specific keys can be picked from the matching items.
     * @param label - The label or collection name where the items are stored.
     * @param query - A function that evaluates whether an item matches the query.
     * @param pickKeys - An optional array of keys to pick from the matching items.
     * @returns A promise that resolves with a `QueryableArray` of matching items.
     */
    find<T extends PersistedEntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<QueryableArray<Pick<T, K>>>;

    /**
     * Retrieves all items from a specific label or collection in the storage.
     * @param label - The label or collection name to retrieve items from.
     * @returns A promise that resolves with a `QueryableArray` of all items in the specified label.
     */
    all<T extends PersistedEntityBase>(label: string): Promise<QueryableArray<T>>;

    /**
     * Retrieves a map of all collections stored in the storage system.
     * @returns A promise that resolves with a map where keys are collection names and values are their corresponding data.
     */
    getCollections(): Promise<Map<string, any>>;

    /**
    * Adds a new collection to the storage system.
    * 
    * This method allows you to add a collection of items to the storage, 
    * where the collection is stored under the specified label.
    *
    * @template T - The type of the items in the collection.
    * @param {string} label - The label or name for the collection being added.
    * @param {T} collection - The collection of items to be added, where `T` is the type of the items.
    * @returns {void} - This method doesn't return anything, it simply adds the collection to storage.
    */
    addCollection<T>(label: string, collection: T): void;

    constructor(config?: IProviderConfig): IOfflineStorageProvider;
}
