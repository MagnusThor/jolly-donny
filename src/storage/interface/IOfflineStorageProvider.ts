import { EntityBase } from '../EntityBase';

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
     * @param item - The item to update, extending the `EntityBase` type.
     * @returns A promise that resolves when the update operation is complete.
     */
    update<T extends EntityBase>(label: string, item: T): Promise<void>;

    /**
     * Deletes an item from the storage.
     * @param label - The label or collection name where the item is stored.
     * @param item - The item to delete, extending the `EntityBase` type.
     * @returns A promise that resolves when the delete operation is complete.
     */
    delete<T extends EntityBase>(label: string, item: T): Promise<void>;

    /**
     * Finds an item in the storage by its unique identifier.
     * @param label - The label or collection name where the item is stored.
     * @param uuid - The unique identifier of the item to find.
     * @returns A promise that resolves with the found item or `undefined` if not found.
     */
    findById<T extends EntityBase>(label: string, uuid: string): Promise<T | undefined>;

    /**
     * Finds items in the storage that match a given query.
     * Optionally, specific keys can be picked from the matching items.
     * @param label - The label or collection name where the items are stored.
     * @param query - A function that evaluates whether an item matches the query.
     * @param pickKeys - An optional array of keys to pick from the matching items.
     * @returns A promise that resolves with an array of matching items, with picked keys if specified.
     */
    find<T extends EntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<Array<Pick<T, K>>>;

    /**
     * Retrieves all items from a specific label or collection in the storage.
     * @param label - The label or collection name to retrieve items from.
     * @returns A promise that resolves with an array of all items in the specified label.
     */
    all<T extends EntityBase>(label: string): Promise<Array<T>>;

    /**
     * Retrieves a map of all models stored in the storage system.
     * @returns A promise that resolves with a map where keys are model names and values are their corresponding data.
     */
    getModels(): Promise<Map<string, any>>;
}
