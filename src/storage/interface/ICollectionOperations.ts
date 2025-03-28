import { PersistedEntityBase } from '../entity/EntityBase';
import { QueryableArray } from '../utils/QueryableArray';

/**
 * Interface representing operations that can be performed on a collection.
 * 
 * @template T - The type of the entity that extends `EntityBase`.
 */
export interface ICollectionOperations<T extends PersistedEntityBase> {
    /**
     * Inserts a new item into the collection.
     * 
     * @param item - The item to insert.
     * @param silent - Optional flag to suppress notifications or side effects.
     * @returns A promise that resolves to the inserted item.
     */
    insert: (item: T, silent?: boolean) => Promise<T>;

    /**
     * Updates an existing item in the collection.
     * 
     * @param item - The item to update.
     * @returns A promise that resolves when the update is complete.
     */
    update: (item: T) => Promise<void>;

    /**
     * Deletes an item from the collection.
     * 
     * @param item - The item to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    delete: (item: T) => Promise<void>;

    /**
     * Finds an item in the collection by its unique identifier.
     * 
     * @param uuid - The unique identifier of the item.
     * @returns A promise that resolves to the found item or `undefined` if not found.
     */
    findById: (uuid: string) => Promise<T | undefined>;

    /**
     * Finds items in the collection that match a given query.
     * 
     * @template K - The keys of the entity to pick.
     * @param query - A function that determines whether an item matches the query.
     * @param pickKeys - Optional array of keys to pick from the matched items.
     * @returns A promise that resolves to a `QueryableArray` of the picked items.
     */
    find: <K extends keyof T = keyof T>(query: (item: T) => boolean, pickKeys?: K[]) => Promise<QueryableArray<Pick<T, K>>>;

    /**
     * Retrieves all items in the collection.
     * 
     * @returns A promise that resolves to a `T[]` of all items.
     */
    all: () => Promise<T[]>;

    /**
     * Retrieves an item from the collection by its index.
     * 
     * @param index - The index of the item to retrieve.
     * @returns A promise that resolves to the item at the specified index.
     */
    get: (index: number) => Promise<T>;

    /**
     * Converts the collection's items into an array.
     * 
     * @returns A promise that resolves to a `QueryableArray<T>` of all items.
     */
    toArray: () => Promise<QueryableArray<T>>;
    /**
     * Converts the collection's items into an array.
     * 
     * @returns A promise that resolves to a `Array` of all items.
     */

    /**
     * Updates all items in the storage that match the given predicate.
     * @param predicate A function to test each element for a condition.
     * @param update A function to update the matching elements.
     * @returns A promise that resolves when all matching items have been updated.
     */
    updateAll: (predicate: (item: T) => boolean, update: (item: T) => void) => Promise<void>;


    /**
     * Deletes multiple items by predicate or array.
     * @param predicateOrItems Predicate or items to delete.
     * @returns Promise resolving on completion.
     */
    deleteMany: (predicateOrItems: ((item: T) => boolean) | T[]) => Promise<void>;


}