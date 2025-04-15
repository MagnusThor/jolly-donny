import { PersistedEntityBase } from '../entity/PersistedEntityBase';
import { IInterceptor } from '../interface/IInterceptor';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';
import { IProviderConfig } from '../interface/IProviderConfig';
import { QueryableArray } from '../utils/QueryableArray';

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
    constructor(config?: IProviderConfig) {
        this.config = config;
        console.log('config', config);
    }

    private config?: IProviderConfig;
    private models: Map<string, any> = new Map();
    private storageName!: string;

    private async delegateToInterceptor<T>(
        method: (interceptor: IInterceptor, label: string, config?: { url?: string; method?: string }, ...args: any[]) => Promise<T>,
        label: string,
        config?: { url?: string; method?: string },
        ...args: any[]
    ): Promise<T | void> {
        if (this.hasInterceptor()) {
            return method(this.config!.interceptor!, label, config, ...args);
        }
        return undefined;
    }

    private hasInterceptor(): boolean {
        return !!(this.config && this.config.interceptor);
    }
        
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
        if (this.config?.interceptor) {
            await this.config.interceptor.init(storageName); // Initialize interceptor if present.
        }
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
     
        if (this.hasInterceptor()) {
            await this.delegateToInterceptor(
                (interceptor, label, config, item) => {
                    const endpointConfig = this.config?.endPoints?.update;
                    return interceptor.update<T>(label, item, endpointConfig?.url, endpointConfig?.method);
                },
                label,
                this.config?.endPoints?.update,
                item
            );
        }        
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
        if (this.hasInterceptor()) {
            await this.delegateToInterceptor(
                (interceptor, label, config, item) => {
                    const endpointConfig = this.config?.endPoints?.update;
                    return interceptor.delete<T>(label, item, endpointConfig?.url, endpointConfig?.method);
                },
                label,
                this.config?.endPoints?.update,
                item
            );
        }
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
     * @param id - The unique number of the entity to find.
     * @returns A promise that resolves to the entity of type `T` if found, or `undefined` if not found.
     */
    async findById<T extends PersistedEntityBase>(label: string, id: string): Promise<T | undefined> {
        if (this.hasInterceptor()) {
            await this.delegateToInterceptor(
                (interceptor, label, config, item) => {
                    const endpointConfig = this.config?.endPoints?.update;
                    return interceptor.findById<T>(label, item, endpointConfig?.url, endpointConfig?.method);
                },
                label,
                this.config?.endPoints?.update,
                id
            );
        }

        const model = this.models.get(label);
        if (model) {
            return model.collection.find((pre: T) => pre.id === id);
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
    ): Promise<QueryableArray<Pick<T, K>>> {
        const model = this.models.get(label);
        if (!model) {
            return new QueryableArray<Pick<T, K>>(...[]);
        }

        const filteredItems = model.collection.filter(query) as T[];

        let result: Pick<T, K>[];
        if (pickKeys) {
            result = filteredItems.map((item) => {
                const picked: Pick<T, K> = {} as Pick<T, K>;
                pickKeys.forEach((key) => {
                    if (key in item) {
                        picked[key] = item[key];
                    }
                });
                return picked;
            });
        } else {
            result = filteredItems;
        }

        return new QueryableArray(...result);
    }

    /**
     * Retrieves all entities of a specified type from the local storage provider.
     *
     * @template T - The type of the entities, extending `PersistedEntityBase`.
     * @param label - The label identifying the collection of entities to retrieve.
     * @returns A promise that resolves to an array of entities of type `T`.
     *          If the label does not exist, an empty array is returned.
     */
    async all<T extends PersistedEntityBase>(label: string): Promise<QueryableArray<T>> {
        if (this.hasInterceptor()) {
            const result = await this.delegateToInterceptor(
                (interceptor, label) => interceptor.all<T>(label),
                label
            );
            return new QueryableArray<T>(...(result || []));
        }
        const model = this.models.get(label);
        if (model) {
            return new QueryableArray<T>(...model.collection);
        }
        return new QueryableArray<T>();
    }

    /**
     * Fetches all persisted entities of a given type associated with the specified label.
     *
     * This method first checks if an interceptor is available. If an interceptor exists,
     * it delegates the fetching operation to the interceptor's `all` method. If no interceptor
     * is present, it retrieves the entities directly using the `all` method.
     *
     * @template T - The type of the persisted entities, extending `PersistedEntityBase`.
     * @param label - The label associated with the entities to fetch.
     * @returns A promise that resolves to an array of entities of type `T`. If no entities
     *          are found, an empty array is returned.
     */
    async fetchAll<T extends PersistedEntityBase>(label: string): Promise<Array<T>> {
        if (this.hasInterceptor()) {
            return (await this.delegateToInterceptor(
                (interceptor, label) => interceptor.all<T>(label),
                label
            )) || [];
        }
        return this.all<T>(label);
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
    addCollection<T>(label: string, model: T): void {
        this.models.set(label, model);
    }

    /**
     * Serializes the current state of the `models` map into a JSON string.
     * Converts the map entries into an array before serialization to ensure
     * compatibility with JSON format.
     *
     * @returns {string} A JSON string representation of the `models` map.
     */
    private serialize(): string {
        return JSON.stringify(Array.from(this.models.entries()));
    }

    /**
     * Deserializes data from localStorage and populates the `models` map.
     * 
     * This method retrieves a JSON string from localStorage using the `storageName` property,
     * parses it, and converts it into a Map object to populate the `models` property.
     * 
     * @returns A promise that resolves when the data is successfully deserialized.
     * @throws An error if no data is found in localStorage or if the data cannot be parsed.
     */
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