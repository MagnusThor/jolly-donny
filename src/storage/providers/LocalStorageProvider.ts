import { PersistedEntityBase } from '../entity/PersistedEntityBase';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';
import { IProviderConfig } from '../interface/IProviderConfig';

/**
 * The `LocalStorageProvider` class implements the `IOfflineStorageProvider` interface
 * and provides a mechanism for managing data storage using the browser's local storage.
 * 
 * This provider allows for the creation, retrieval, updating, and deletion of collections
 * and their associated entities. It also supports querying and serialization of data.
 * 
 * ### Features:
 * - Initialize storage with a specific name.
 * - Add, update, delete, and retrieve entities in collections.
 * - Query collections with custom filters and optional key selection.
 * - Serialize and deserialize data for persistence in local storage.
 * - Manage multiple collections using a map-based structure.
 * 
 * ### Usage:
 * 1. Initialize the provider with a storage name using the `init` method.
 * 2. Add collections using the `addCollection` method.
 * 3. Perform CRUD operations on entities within collections.
 * 4. Save changes to local storage using the `save` method.
 * 
 * ### Example:
 * ```typescript
 * const provider = new LocalStorageProvider();
 * await provider.init('myStorage');
 * provider.addCollection('users', { collection: [] });
 * await provider.update('users', { id: '1', name: 'John Doe', lastModified: Date.now() });
 * const user = await provider.findById('users', '1');
 * console.log(user);
 * ```
 * 
 * @implements {IOfflineStorageProvider}
 */
export class LocalStorageProvider implements IOfflineStorageProvider {
    ['constructor'](config?: IProviderConfig): IOfflineStorageProvider {
        throw new Error('Method not implemented.');
    }
    /**
     * Creates an instance of the LocalStorageProvider.
     *
     * @param config - Optional configuration object implementing the IProviderConfig interface.
     *                 This can be used to customize the behavior of the provider.
     */
    constructor(config?: IProviderConfig){    
        console.log("",config);    
    }
    private models: Map<string, any> = new Map();
    private storageName!: string;

    /**
     * Initializes the local storage provider with the specified storage name.
     * This method sets the storage name and attempts to deserialize any existing
     * data associated with it.
     *
     * @param storageName - The name of the storage to initialize.
     * @returns A promise that resolves when the initialization is complete.
     */
    async init(storageName: string): Promise<void> {
        this.storageName = storageName;
        await this.deSerialize();
    }

    /**
     * Saves the current state of the storage provider to the browser's local storage.
     *
     * @returns A promise that resolves once the data has been successfully saved.
     */
    async save(): Promise<void> {
        return new Promise<void>((resolve) => {
            const data = this.serialize();
            localStorage.setItem(this.storageName, data);
            resolve();
        });
    }

    /**
     * Updates an existing item in the collection associated with the given label.
     * If the item does not exist in the collection, it will be added.
     * The `lastModified` property of the item is updated to the current timestamp.
     * 
     * @template T - A type that extends `PersistedEntityBase`.
     * @param label - The label identifying the collection to update.
     * @param item - The item to update or add to the collection.
     * @returns A promise that resolves when the update operation is complete.
     */
    async update<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const model = this.models.get(label);
        
        if (model) {
            const index = model.collection.findIndex((pre: T) => pre.id === item.id);
            if (index !== -1) {
                item.lastModified = Date.now();
                model.collection[index] = item;
            }else{
                model.collection.push(item);
            }
            
        }
        await this.save();
    }

    /**
     * Deletes an item from the specified collection in local storage.
     *
     * @template T - The type of the entity that extends `PersistedEntityBase`.
     * @param label - The label identifying the collection to delete the item from.
     * @param item - The item to be deleted, identified by its `id` property.
     * @returns A promise that resolves when the item has been removed and the changes are saved.
     */
    async delete<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const model = this.models.get(label);
        if (model) {
            const index = model.collection.findIndex((pre: T) => pre.id === item.id);
            if (index !== -1) {
                model.collection.splice(index, 1);
            }
        }
        await this.save();
    }

    /**
     * Retrieves an entity of type `T` from the specified collection by its unique identifier.
     *
     * @template T - The type of the entity, extending `PersistedEntityBase`.
     * @param label - The label identifying the collection to search in.
     * @param uuid - The unique identifier of the entity to find.
     * @returns A promise that resolves to the entity of type `T` if found, or `undefined` if not found.
     */
    async findById<T extends PersistedEntityBase>(label: string, uuid: string): Promise<T | undefined> {
        const model = this.models.get(label);
        if (model) {
            return model.collection.find((pre: T) => pre.id === uuid);
        }
        return undefined;
    }

    /**
     * Finds and retrieves items from a specified model based on a query function.
     * Optionally, specific keys can be picked from the matched items.
     *
     * @template T - The type of the persisted entity.
     * @template K - The keys of the entity to pick (defaults to all keys of T).
     * @param label - The label identifying the model to search within.
     * @param query - A function used to filter items in the model's collection.
     * @param pickKeys - An optional array of keys to pick from the matched items.
     * @returns A promise that resolves to an array of items matching the query,
     *          with only the specified keys if `pickKeys` is provided.
     */
    async find<T extends PersistedEntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<Array<Pick<T, K>>> {
        const model = this.models.get(label);
        if (!model) {
            return [];
        }

        const filteredItems = model.collection.filter(query) as T[];

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

    /**
     * Retrieves all entities of a specified type from the local storage provider.
     *
     * @template T - The type of the entities, extending `PersistedEntityBase`.
     * @param label - The label identifying the collection of entities to retrieve.
     * @returns A promise that resolves to an array of entities of type `T`.
     *          If the label does not exist, an empty array is returned.
     */
    async all<T extends PersistedEntityBase>(label: string): Promise<Array<T>> {
        const model = this.models.get(label);
        if (model) {
            return model.collection;
        }
        return [];
    }

    /**
     * Retrieves all collections stored in the local storage provider.
     *
     * @returns {Promise<Map<string, any>>} A promise that resolves to a map containing the collections,
     * where the keys are collection names and the values are the corresponding data.
     */
    async getCollections(): Promise<Map<string, any>> {
        return Promise.resolve(this.models);
    }


    /**
     * Adds a new collection to the local storage provider.
     *
     * @template T - The type of the persisted entity, extending `PersistedEntityBase`.
     * @param label - The unique label used to identify the collection.
     * @param model - The model representing the structure of the collection.
     * @returns void
     */
    addCollection<T extends PersistedEntityBase>(label: string, model: any): void {
        this.models.set(label, model);
    }

    private serialize(): string {
        return JSON.stringify(Array.from(this.models.entries()));
    }

    private async deSerialize(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const data = localStorage.getItem(this.storageName);
            if (!data) {
                reject(new Error('No data found'));
                return;
            }
            try {
                const parsedData = JSON.parse(data);
                this.models = new Map(parsedData);
                resolve();
            } catch (e) {
                reject(new Error('Error parsing data'));
            }
        });
    }
}