import { PersistedEntityBase } from '../entity/PersistedEntityBase';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';
import { IProviderConfig } from '../interface/IProviderConfig';

export class FileSystemProvider implements IOfflineStorageProvider {
    private rootHandle: FileSystemDirectoryHandle | undefined;
    private collections: Map<string, any> = new Map();
    private storageName = '';

    /**
     * Creates an instance of the FileSystemProvider.
     * 
     * @param config - Optional configuration object implementing the IProviderConfig interface.
     */
    constructor(private config?: IProviderConfig) {}
    ["constructor"](config?: IProviderConfig): IOfflineStorageProvider {
        throw new Error("Method not implemented.");
    }

    /**
     * Initializes the file system storage provider with the specified storage name.
     * This method sets up the storage name, prompts the user to select a directory
     * with read-write access, and loads the collections from the selected directory.
     *
     * @param storageName - The name of the storage to initialize.
     * @returns A promise that resolves when the initialization is complete.
     */
    async init(storageName: string): Promise<void> {
        this.storageName = storageName;
        this.rootHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        await this.loadCollections();
    }

    /**
     * Loads collections from the file system and populates the `collections` map.
     * 
     * This method iterates through the entries in the `rootHandle` directory, identifying
     * files with a `.json` extension. For each valid file, it reads the content, parses it
     * as JSON, and stores the resulting data in the `collections` map. If a custom parser
     * is provided in the configuration, it will be used to process the file content; otherwise,
     * a default parser assumes the JSON contains an array.
     * 
     * @returns A promise that resolves when all collections have been loaded.
     * 
     * @throws Will log a warning to the console if a file cannot be parsed as JSON.
     */
    private async loadCollections(): Promise<void> {
        if (!this.rootHandle) return;

        for await (const [name, handle] of this.rootHandle.entries()) {
            if (handle.kind === 'file' && name.endsWith('.json')) {
                const file = await (handle as FileSystemFileHandle).getFile();
                const content = await file.text();
                const label = name.replace('.json', '');
                try {
                    const loadedResults = JSON.parse(content);
                    if (this.config?.parser) {
                        // Use custom parser from config
                        const parsedCollections = this.config.parser(content, this, loadedResults);
                        parsedCollections.forEach((data, collectionLabel) => {
                            this.collections.set(collectionLabel, data);
                        });
                    } else {
                        // Default parser (assuming JSON contains an array)
                        console.log(`Loading collection: ${label}`,loadedResults);
                        this.collections.set(label, loadedResults);
                    }
                } catch (err) {
                    console.warn(`Failed to parse ${name}:`, err);
                }
            }
        }
    }

    /**
     * Saves the current state of all collections to the file system.
     * 
     * This method iterates over all collections stored in the `collections` map
     * and writes their contents to individual JSON files within the directory
     * represented by `rootHandle`. Each file is named after the collection's label
     * with a `.json` extension.
     * 
     * If `rootHandle` is not defined, the method exits early without performing any operations.
     * 
     * @returns A promise that resolves when all collections have been successfully saved.
     * @throws An error if any file operation fails during the save process.
     */
    async save(): Promise<void> {
        if (!this.rootHandle) return;

        for (const [label, items] of this.collections.entries()) {
            const fileHandle = await this.rootHandle.getFileHandle(`${label}.json`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(items, null, 2));
            await writable.close();
        }
    }

    /**
     * Adds a new collection to the storage provider if it does not already exist.
     *
     * @template T - The type of entities in the collection, extending `PersistedEntityBase`.
     * @param label - The unique identifier for the collection.
     * @param collection - The collection to be added.
     * 
     * @remarks
     * If a collection with the specified label already exists, this method does nothing.
     */
    addCollection<T extends PersistedEntityBase>(label: string, collection: any): void {
        if (!this.collections.has(label)) {
            this.collections.set(label, []);
        }
    }

    /**
     * Updates an existing item in the collection identified by the given label.
     * If the item does not exist in the collection, it is added to the collection.
     *
     * @template T - The type of the entity extending `PersistedEntityBase`.
     * @param label - The label identifying the collection to update.
     * @param item - The item to update or add to the collection.
     * @returns A promise that resolves when the operation is complete.
     */
    async update<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const collection = this.ensureCollection<T>(label);
        const index = collection.findIndex((i: T) => i.id === item.id);
        if (index !== -1) {
            collection[index] = item;
        } else {
            collection.push(item);
        }
    }

    /**
     * Deletes an item from the specified collection based on its label and ID.
     *
     * @template T - The type of the entity that extends `PersistedEntityBase`.
     * @param label - The label identifying the collection from which the item will be deleted.
     * @param item - The item to be deleted, identified by its `id` property.
     * @returns A promise that resolves when the deletion is complete.
     */
    async delete<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const collection = this.ensureCollection<T>(label);
        const index = collection.findIndex((i: T) => i.id === item.id);
        if (index !== -1) {
            collection.splice(index, 1);
        }
    }

    /**
     * Retrieves an entity of type `T` from the specified collection by its unique identifier.
     *
     * @template T - The type of the entity, which extends `PersistedEntityBase`.
     * @param label - The label identifying the collection to search in.
     * @param id - The unique identifier of the entity to find.
     * @returns A promise that resolves to the entity of type `T` if found, or `undefined` if no entity matches the given ID.
     */
    async findById<T extends PersistedEntityBase>(label: string, id: string): Promise<T | undefined> {
        const collection = this.ensureCollection<T>(label);
        return collection.find((item: T) => item.id === id);
    }

    /**
     * Finds and retrieves items from a collection based on a query function and optionally picks specific keys from the items.
     *
     * @template T - The type of the entities in the collection, extending `PersistedEntityBase`.
     * @template K - The keys of the entity type `T` that can be picked, defaults to all keys of `T`.
     * 
     * @param label - The label identifying the collection to search in.
     * @param query - A function that determines whether an item in the collection matches the search criteria.
     * @param pickKeys - An optional array of keys to pick from the matching items. If not provided, the entire item is returned.
     * 
     * @returns A promise that resolves to an array of items matching the query. Each item contains only the specified keys if `pickKeys` is provided, otherwise the entire item is returned.
     */
    async find<T extends PersistedEntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<Array<Pick<T, K>>> {
        const collection = this.ensureCollection<T>(label);
        return collection
            .filter(query)
            .map((item: T) => (pickKeys ? this.pick(item, pickKeys) : item)) as Array<Pick<T, K>>;
    }

    /**
     * Retrieves all persisted entities of a specified type from the storage.
     *
     * @template T - The type of the persisted entities, extending `PersistedEntityBase`.
     * @param label - The label identifying the collection of entities to retrieve.
     * @returns A promise that resolves to an array of entities of type `T`.
     */
    async all<T extends PersistedEntityBase>(label: string): Promise<T[]> {
        return this.ensureCollection<T>(label);
    }

    /**
     * Retrieves all collections stored in the file system provider.
     *
     * @returns {Promise<Map<string, any>>} A promise that resolves to a map containing the collections,
     * where the keys are collection names (strings) and the values are the corresponding data (any).
     */
    async getCollections(): Promise<Map<string, any>> {
        return new Map(this.collections);
    }

    /**
     * Ensures that a collection with the specified label exists in the internal collections map.
     * If the collection does not exist, it initializes it as an empty array.
     *
     * @template T - The type of elements in the collection.
     * @param label - The unique identifier for the collection.
     * @returns The collection associated with the given label.
     */
    private ensureCollection<T>(label: string): T[] {
        if (!this.collections.has(label)) {
            this.collections.set(label, []);
        }
        return this.collections.get(label);
    }

    /**
     * Creates a new object composed of the specified keys from the given object.
     *
     * @template T - The type of the source object.
     * @template K - The keys of the source object to pick.
     * @param obj - The source object to pick properties from.
     * @param keys - An array of keys to select from the source object.
     * @returns A new object containing only the specified keys and their values from the source object.
     */
    private pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
        const result = {} as Pick<T, K>;
        for (const key of keys) {
            result[key] = obj[key];
        }
        return result;
    }
}
