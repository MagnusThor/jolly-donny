import { EntityBase } from './entity/EntityBase';
import { IModelOperations } from './interface/IModelOperations';
import { IOfflineGraph } from './interface/IOfflineGraph';
import { IOfflineStorageProvider } from './interface/IOfflineStorageProvider';
import { QueryableArray } from './QueryableArray';

/**
 * The `OfflineStorage` class provides a mechanism for managing offline data storage
 * with support for CRUD operations, querying, and change notifications. It utilizes
 * a storage provider implementing the `IOfflineStorageProvider` interface to handle
 * the underlying storage operations.
 *
 * ### Features:
 * - CRUD operations (`insert`, `update`, `delete`) for entities extending `EntityBase`.
 * - Querying capabilities with support for filtering and property selection.
 * - Change notifications via the `onChange` callback.
 * - Utility methods for picking and omitting properties from objects.
 * - Support for managing multiple labeled collections of entities.
 *
 * ### Example Usage:
 * ```typescript
 * const storageProvider: IOfflineStorageProvider = new MyStorageProvider();
 * const offlineStorage = new OfflineStorage(storageProvider, 'my-storage');
 *
 * await offlineStorage.init();
 *
 * const userModel = offlineStorage.getModel<User>('users');
 * await userModel.insert({ id: '1', name: 'John Doe' });
 * const users = await userModel.all();
 * console.log(users);
 * ```
 *
 * @template T - The type of entities managed by the storage, extending `EntityBase`.
 */
export class OfflineStorage {

    onChange?: (change: {
        label: string;
        origin: 'insert' | 'update' | 'delete' | 'save';
        item?: any;
        items?: any[];
    }) => void;

    storageName: string;

    private provider: IOfflineStorageProvider;

    /**
     * Creates an instance of the OfflineStorage class.
     *
     * @param provider - An implementation of the IOfflineStorageProvider interface used to handle storage operations.
     * @param storageName - The name of the storage. Defaults to 'jolly-dolly' if not provided.
     */
    constructor(provider: IOfflineStorageProvider, storageName: string = 'jolly-dolly') {
        this.storageName = storageName;
        this.provider = provider;
    }

    /**
     * Selects a subset of properties from an object based on the provided keys.
     *
     * @template T - The type of the object to pick properties from.
     * @template K - The keys of the properties to pick from the object.
     * @param model - The object from which properties will be picked.
     * @param keys - The keys of the properties to include in the resulting object.
     * @returns A new object containing only the specified keys and their corresponding values from the input object.
     */
    static pick<T extends object, K extends keyof T>(model: T, ...keys: K[]): Pick<T, K> {
        const result = {} as Pick<T, K>;
        for (const key of keys) {
            if (key in model) {
                result[key] = model[key];
            }
        }
        return result;
    }

    /**
     * Creates a shallow copy of the given object, omitting the specified keys.
     *
     * @template T - The type of the input object.
     * @template K - The keys of the input object to omit.
     * @param model - The object to copy and omit keys from.
     * @param keys - The keys to omit from the resulting object.
     * @returns A new object with the specified keys omitted.
     */
    static omit<T extends object, K extends keyof T>(model: T, ...keys: K[]): Omit<T, K> {
        const result = { ...model } as Omit<T, K>;
        for (const key of keys) {
            delete (result as any)[key];
        }
        return result;
    }


    private parseItem<T extends EntityBase>(label: string, item: any): T {
        if (item && typeof (item) === 'object' && 'fromJSON' in item) {
            const temp = new (item.constructor)();
            temp.fromJSON(item);
            return temp;
        }
        return item as T;
    }

    /**
     * Retrieves a set of model operations for a specific entity type.
     * 
     * @template T - The type of the entity, extending `EntityBase`.
     * @param label - A string label identifying the entity type.
     * @returns An object implementing `IModelOperations<T>` with methods to perform CRUD operations and queries:
     * 
     * - `insert`: Inserts a new entity of type `T`.
     * - `update`: Updates an existing entity of type `T`.
     * - `delete`: Deletes an entity of type `T`.
     * - `findById`: Finds an entity by its unique identifier.
     * - `find`: Finds entities matching a query function, optionally picking specific keys.
     * - `all`: Retrieves all entities of type `T`.
     * - `get`: Retrieves an entity by its index in the collection.
     * - `toArray`: Retrieves all entities as an array.
     */
    getModel<T extends EntityBase>(label: string): IModelOperations<T> {
        return {
            insert: async (item: T, silent?: boolean) => this.insert(label, item, silent),
            update: (item: T) => this.update(label, item),
            delete: (item: T) => this.delete(label, item),
            findById: (uuid: string) => this.findById(label, uuid),
            find: <K extends keyof T = keyof T>(query: (item: T) => boolean, pickKeys?: K[]) => this.find(label, query, pickKeys),
            all: () => this.all( label ),
            get: async (index: number) => {
                const allItems = await this.all(label );
                return allItems[index] as T;
            },
            toArray: async () => {
                return await this.all( label );
            },
            updateAll: async (predicate: (item: T) => boolean, update: (item: T) => void) => {
                await this.updateAll(label, predicate, update);
            },
            deleteMany: async (predicateOrItems: ((item: T) => boolean) | T[]) => {
                await this.deleteMany(label, predicateOrItems);
            }, 
        };
    }


    /**
     * Adds a new model to the offline storage with the specified label.
     *
     * @template T - The type of the entities that the model will manage, extending `EntityBase`.
     * @param label - The label used to identify the new model.
     * @returns A promise that resolves to the newly created offline graph model.
     */
    async addModel<T extends EntityBase>(label: string): Promise<IOfflineGraph<T>> {
        const newModel: IOfflineGraph<T> = { label: label, collection: [] };
        this.provider.addModel(label, newModel);
    
        return newModel;
    }

    /**
     * Saves the current state of the storage using the underlying provider.
     * If an `onChange` callback is defined, it will be invoked after the save operation
     * with details about the storage name and the origin of the change.
     *
     * @returns A promise that resolves when the save operation is complete.
     */
    async save(): Promise<void> {
        await this.provider.save();
        if (this.onChange) this.onChange({ label: this.storageName, origin: 'save' });
    }

    /**
     * Inserts an item into the storage under the specified label.
     * Optionally triggers a change event unless silenced.
     *
     * @template T - The type of the entity being inserted, extending `EntityBase`.
     * @param label - The label under which the item will be stored.
     * @param item - The item to be inserted into the storage.
     * @param silent - Optional flag to suppress the `onChange` event if set to `true`.
     * @returns A promise that resolves to the inserted item.
     */
    async insert<T extends EntityBase>(label: string, item: T, silent?: boolean): Promise<T> {
        await this.provider.update(label, item);
        if (this.onChange && !silent) this.onChange({ label, origin: 'insert', item });
        return item;
    }

    /**
     * Updates an item in the storage with the specified label.
     * 
     * @template T - The type of the entity being updated, extending `EntityBase`.
     * @param label - A string representing the label or key associated with the item.
     * @param item - The item of type `T` to be updated in the storage.
     * @returns A promise that resolves when the update operation is complete.
     * 
     * @remarks
     * This method also triggers the `onChange` callback, if defined, 
     * with details about the update operation, including the label, 
     * origin of the change, and the updated item.
     */
    async update<T extends EntityBase>(label: string, item: T): Promise<void> {
        await this.provider.update(label, item);
        if (this.onChange) this.onChange({ label, origin: 'update', item });
    }

    /**
     * Updates all items of a specific type in the storage that match a given predicate.
     *
     * @template T - The type of the entities being updated, extending `EntityBase`.
     * @param label - A string label used to identify the collection of items.
     * @param predicate - A function that determines whether an item should be updated.
     *                     It receives an item of type `T` and returns a boolean.
     * @param update - A function that performs the update on an item of type `T`.
     *                 It modifies the item in place.
     * @returns A promise that resolves when all matching items have been updated.
     */
    async updateAll<T extends EntityBase>(label: string, predicate: (item: T) => boolean, update: (item: T) => void): Promise<void> {
        const items = await this.all<T>( label );
        for (const item of items) {
            if (predicate(item)) {
                update(item);
                await this.update(label, item);
            }
        }
    }

    /**
     * Deletes an item of type `T` associated with the specified label from the storage.
     * 
     * @template T - The type of the entity to be deleted, extending `EntityBase`.
     * @param label - A string representing the label or key associated with the item.
     * @param item - The item of type `T` to be deleted.
     * @returns A promise that resolves when the deletion is complete.
     * 
     * @remarks
     * If an `onChange` callback is defined, it will be invoked after the deletion
     * with details about the operation, including the label, origin, and the deleted item.
     */
    async delete<T extends EntityBase>(label: string, item: T): Promise<void> {
        await this.provider.delete(label, item);
        if (this.onChange) this.onChange({ label, origin: 'delete', item });
    }

    /**
     * Deletes multiple items from storage based on a label and either a predicate function
     * or an array of items to delete.
     *
     * @template T - The type of the entities extending `EntityBase`.
     * @param label - The label identifying the storage collection.
     * @param predicateOrItems - Either a predicate function to filter items for deletion
     * or an array of items to delete directly.
     * 
     * If a predicate function is provided, all items in the storage collection matching
     * the predicate will be deleted. If an array of items is provided, each item in the
     * array will be deleted.
     * 
     * @returns A promise that resolves when the deletion process is complete.
     */
    async deleteMany<T extends EntityBase>(label: string, predicateOrItems: ((item: T) => boolean) | T[]): Promise<void> {
        if (Array.isArray(predicateOrItems)) {
            // Delete by items array
            for (const item of predicateOrItems) {
                await this.delete(label, item);
            }
        } else {
            // Delete by predicate
            const items = await this.all<T>(label);
            for (const item of items) {
                if (predicateOrItems(item)) {
                    await this.delete(label, item);
                }
            }
        }
    }



    /**
     * Retrieves an entity of type `T` by its unique identifier (UUID) from the storage.
     *
     * @template T - The type of the entity that extends `EntityBase`.
     * @param label - A string representing the label or category of the entity.
     * @param uuid - The unique identifier of the entity to retrieve.
     * @returns A promise that resolves to the entity of type `T` if found, or `undefined` if not found.
     */
    async findById<T extends EntityBase>(label: string, uuid: string): Promise<T | undefined> {
        const item = await this.provider.findById(label, uuid);
        if (!item) return undefined;
        return this.parseItem(label, item) as T;
    }
    /**
     * Finds and retrieves items from the storage based on the specified label and query function.
     * Optionally, specific keys can be picked from the retrieved items.
     *
     * @template T - The type of the entity being queried, extending `EntityBase`.
     * @template K - The keys of the entity type `T` that can be picked, defaults to all keys of `T`.
     *
     * @param label - A string label used to identify the collection or group of items in the storage.
     * @param query - A function that takes an item of type `T` and returns a boolean indicating
     *                whether the item matches the query criteria.
     * @param pickKeys - An optional array of keys of type `K` to specify which properties of the
     *                   items should be included in the result. If not provided, all properties
     *                   are included.
     *
     * @returns A promise that resolves to a `QueryableArray` containing the items of type `T`
     *          that match the query, with only the specified keys if `pickKeys` is provided.
     */
    async find<T extends EntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<QueryableArray<Pick<T, K>>> {
        const items = await this.provider.find(label, query, pickKeys);
        return new QueryableArray(...items.map(item => this.parseItem(label, item) as unknown as Pick<T, K>));
    }

    /**
     * Retrieves all entities of a specified type from the storage provider.
     *
     * @template T - The type of entities to retrieve, extending `EntityBase`.
     * @param {Object} params - The parameters for the query.
     * @param {string} params.label - The label identifying the type of entities to retrieve.
     * @returns {Promise<Array<T>>} A promise that resolves to a `QueryableArray` containing the retrieved entities.
     */
    async all<T extends EntityBase>(label: string): Promise<QueryableArray<T>> {
        try {
            const items = await this.provider.all(label);
            const parsedItems = items.map(item => {
                const parsedItem = this.parseItem<T>(label, item);
                if (!parsedItem) {
                    console.warn(`Failed to parse item for label ${label}:`, item);
                    return null;
                }
                return parsedItem;
            }).filter(item => item !== null) as T[];
    
            return new QueryableArray(...parsedItems);
        } catch (error) {
            console.error(`Error retrieving all items for label ${label}:`, error);
            return new QueryableArray(); // Or throw an error, depending on your error-handling strategy
        }
    }

    /**
     * Initializes the offline storage provider with the specified storage name.
     * This method ensures that the storage provider is ready for use.
     *
     * @returns A promise that resolves when the initialization is successful,
     *          or rejects with an error if the initialization fails.
     */
    init(): Promise<void> {
        
        return new Promise<void>(async (resolve, reject) => {
            try {
                await this.provider.init(this.storageName);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}