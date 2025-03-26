import { EntityBase } from '../EntityBase';
import { QueryableArray } from '../QueryableArray';

/**
 * Interface representing operations that can be performed on a model.
 * 
 * @template T - The type of the entity that extends `EntityBase`.
 */
export interface IModelOperations<T extends EntityBase> {
    /**
     * Inserts a new item into the model.
     * 
     * @param item - The item to insert.
     * @param silent - Optional flag to suppress notifications or side effects.
     * @returns A promise that resolves to the inserted item.
     */
    insert: (item: T, silent?: boolean) => Promise<T>;

    /**
     * Updates an existing item in the model.
     * 
     * @param item - The item to update.
     * @returns A promise that resolves when the update is complete.
     */
    update: (item: T) => Promise<void>;

    /**
     * Deletes an item from the model.
     * 
     * @param item - The item to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    delete: (item: T) => Promise<void>;

    /**
     * Finds an item in the model by its unique identifier.
     * 
     * @param uuid - The unique identifier of the item.
     * @returns A promise that resolves to the found item or `undefined` if not found.
     */
    findById: (uuid: string) => Promise<T | undefined>;

    /**
     * Finds items in the model that match a given query.
     * 
     * @template K - The keys of the entity to pick.
     * @param query - A function that determines whether an item matches the query.
     * @param pickKeys - Optional array of keys to pick from the matched items.
     * @returns A promise that resolves to a `QueryableArray` of the picked items.
     */
    find: <K extends keyof T = keyof T>(query: (item: T) => boolean, pickKeys?: K[]) => Promise<QueryableArray<Pick<T, K>>>;

    /**
     * Retrieves all items in the model.
     * 
     * @returns A promise that resolves to a `QueryableArray` of all items.
     */
    all: () => Promise<QueryableArray<T>>;

    /**
     * Retrieves an item from the model by its index.
     * 
     * @param index - The index of the item to retrieve.
     * @returns A promise that resolves to the item at the specified index.
     */
    get: (index: number) => Promise<T>;

    /**
     * Converts the model's items into an array.
     * 
     * @returns A promise that resolves to a `QueryableArray` of all items.
     */
    toArray: () => Promise<QueryableArray<T>>;
}