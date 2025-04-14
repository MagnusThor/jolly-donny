import initSqlJs, {
  Database,
  SqlJsStatic,
} from 'sql.js';

import { PersistedEntityBase } from '../entity/PersistedEntityBase';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';
import { IProviderConfig } from '../interface/IProviderConfig';

export class SQLiteJsonProvider implements IOfflineStorageProvider {
    private db: Database | undefined;
    private SQL: SqlJsStatic | undefined;
    private collections: Map<string, any[]> = new Map();
    private storageName: string = '';

    /**
     * Constructs an instance of the SQLLiteProvider class.
     * 
     * @param config - Optional configuration object implementing the `IProviderConfig` interface.
     *                  This configuration can be used to customize the behavior of the provider.
     */
    constructor(public config?: IProviderConfig) { }
    ['constructor'](config?: IProviderConfig): IOfflineStorageProvider {
        throw new Error('Method not implemented.');
    }

    /**
     * Initializes the SQLite provider by loading the SQL.js library and creating a new database instance.
     * 
     * @param storageName - The name of the storage to be used for the database.
     * @returns A promise that resolves when the initialization is complete.
     * 
     * @remarks
     * This method uses the `initSqlJs` function to load the SQL.js library. The `locateFile` option
     * specifies the path to the WebAssembly file required by SQL.js. A new in-memory database is created
     * after the library is loaded.
     */
    /**
     * Initializes the SQLite provider with the specified storage name and optional data.
     * 
     * @param storageName - The name of the storage to initialize.
     * @param data - Optional initial data for the database. Can be an ArrayLike<number>, Buffer, or null.
     * @returns A promise that resolves when the initialization is complete.
     */
    /**
     * Initializes the SQLiteJsonProvider by setting up the SQL.js library and creating a database instance.
     *
     * @param storageName - The name of the storage to be initialized.
     * @param data - Optional binary data to initialize the database. Can be an ArrayLike<number>, Buffer, or null.
     *               If provided, it will be used to populate the database; otherwise, a new empty database will be created.
     * @returns A promise that resolves when the initialization is complete.
     */
    async init(storageName: string,data?: ArrayLike<number> | Buffer | null): Promise<void> {
        this.SQL = await initSqlJs({
            locateFile: file => `./js/${file}` // or 'sql-wasm.wasm' if served from same folder
          });

        //this.SQL = await initSqlJs({ locateFile: (file: any) => `https://sql.js.org/dist/${file}` });
        this.db = new this.SQL.Database(data);
        this.storageName = storageName;
    }

    /**
     * Saves data to the SQLite database.
     * 
     * @throws {Error} Throws an error indicating that the save method is not implemented for SQLiteProvider.
     * @returns {Promise<void>} A promise that resolves when the save operation is complete.
     */
    async save(): Promise<void> {
        throw new Error("Save not implemented for SQLiteProvider");
    }

    /**
     * Updates an existing record in the specified table or inserts it if it does not exist.
     * The table is created if it does not already exist.
     *
     * @template T - A type that extends `PersistedEntityBase`, representing the entity to be updated.
     * @param label - The name of the table where the record will be updated or inserted.
     * @param item - The entity to be updated or inserted. Must have a defined `id` property.
     * @returns A promise that resolves when the operation is complete.
     * @throws {Error} If the `id` property of the item is `undefined`.
     */
    async update<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        await this.ensureTable(label);
        const json = JSON.stringify(item);
        const stmt = `INSERT OR REPLACE INTO ${label} (id, json) VALUES (?, ?)`;
        if (item.id === undefined) {
            throw new Error('Item ID cannot be undefined');
        }
        this.db!.run(stmt, [item.id, json]);
    }

    /**
     * Deletes an entity from the database table corresponding to the specified label.
     * Ensures the table exists before attempting the deletion.
     *
     * @template T - The type of the entity extending `PersistedEntityBase`.
     * @param label - The name of the table from which the entity should be deleted.
     * @param item - The entity to delete, which must have a defined `id` property.
     * @throws {Error} If the `id` property of the entity is undefined.
     * @returns A promise that resolves when the deletion is complete.
     */
    async delete<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        await this.ensureTable(label);
        if (item.id === undefined) {
            throw new Error('Item ID cannot be undefined');
        }
        this.db!.run(`DELETE FROM ${label} WHERE id = ?`, [item.id]);
    }

    /**
     * Retrieves an entity of type `T` from the database by its ID.
     *
     * @template T - The type of the entity to retrieve, extending `PersistedEntityBase`.
     * @param label - The name of the table or label where the entity is stored.
     * @param id - The unique identifier of the entity to retrieve. Can be a string or a number.
     * @returns A promise that resolves to the entity of type `T` if found, or `undefined` if not found.
     * 
     * @throws {Error} If there is an issue ensuring the table exists or querying the database.
     */
    async findById<T extends PersistedEntityBase>(label: string, id: string | number): Promise<T | undefined> {
        await this.ensureTable(label);
        const stmt = this.db!.prepare(`SELECT json FROM ${label} WHERE id = ?`);
        stmt.bind([id]);
        if (stmt.step()) {
            const [json] = stmt.get();
            return typeof json === 'string' ? JSON.parse(json) : undefined;
        }
        return undefined;
    }

    /**
     * Finds and retrieves items from a storage provider based on a specified query and optional keys to pick.
     *
     * @template T - The type of the persisted entity.
     * @template K - The keys of the entity to pick, defaults to all keys of `T`.
     * 
     * @param label - The label identifying the collection of items to search.
     * @param query - A predicate function used to filter items from the collection.
     * @param pickKeys - An optional array of keys to pick from the filtered items. If not provided, the entire item is returned.
     * 
     * @returns A promise that resolves to an array of objects containing only the picked keys (or the entire item if no keys are specified).
     */
    async find<T extends PersistedEntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<Array<Pick<T, K>>> {
        const allItems = await this.all<T>(label);
        return allItems
            .filter(query)
            .map(item => pickKeys ? Object.fromEntries(pickKeys.map(k => [k, item[k]])) as Pick<T, K> : item as Pick<T, K>);
    }

    /**
     * Retrieves all persisted entities of a specified type from the database table corresponding to the given label.
     * 
     * @template T - The type of the persisted entities, extending `PersistedEntityBase`.
     * @param label - The name of the table (or label) to query for persisted entities.
     * @returns A promise that resolves to an array of entities of type `T`.
     * 
     * @throws Will throw an error if the table does not exist or if there is an issue with the database operation.
     */
    async all<T extends PersistedEntityBase>(label: string): Promise<Array<T>> {
        await this.ensureTable(label);
        const result: T[] = [];
        const stmt = this.db!.prepare(`SELECT json FROM ${label}`);
        while (stmt.step()) {
            const [json] = stmt.get();
            if (typeof json === 'string') {
                result.push(JSON.parse(json));
            }
        }     
        
        return result;
    }

    /**
     * Retrieves the collections stored in the provider.
     *
     * @returns {Promise<Map<string, any>>} A promise that resolves to a map containing the collections,
     * where the keys are collection names (strings) and the values are the corresponding data (any).
     */
    async getCollections(): Promise<Map<string, any>> {
        return this.collections;
    }

    /**
     * Adds a new collection to the storage provider and ensures the corresponding table exists in the database.
     *
     * @template T - The type of entities in the collection, extending `PersistedEntityBase`.
     * @param label - The unique label identifying the collection.
     * @param collection - The collection to be added, containing entities of type `T`.
     * @returns A promise that resolves when the collection has been added and the table is ensured.
     */
    async addCollection<T extends PersistedEntityBase>(label: string, collection: any): Promise<void> {
        await this.ensureTable(label);        
        this.collections.set(label, collection);
    }

    /**
     * Ensures that a table with the specified label exists in the database.
     * If the table does not exist, it will be created with the specified schema.
     *
     * @param label - The name of the table to ensure exists.
     * @returns A promise that resolves when the operation is complete.
     */
    private async ensureTable(label: string): Promise<void> {
        const sql = `CREATE TABLE IF NOT EXISTS ${label} (id TEXT PRIMARY KEY, json TEXT)`
        this.db!.run(sql);
    }

    /**
     * Exports the current state of the database as a Uint8Array.
     * 
     * @returns {Uint8Array} The exported database in binary format.
     * @throws {Error} If the database is not initialized.
     */
    exportDb(): Uint8Array {
        if (!this.db) {
            throw new Error("Database is not initialized");
        }
        return this.db.export();
    }
    
    /**
     * Imports a database from a Uint8Array and initializes the SQL.js database instance.
     *
     * @param data - The Uint8Array containing the database file to be imported.
     * @throws {Error} If the SQL.js library is not loaded.
     */
    importDb(data: Uint8Array): void {
        if (!this.SQL) {
            throw new Error("SQL.js not loaded");
        }
        this.db = new this.SQL.Database(data);
    }
    
} 
