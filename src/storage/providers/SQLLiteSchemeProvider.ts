import initSqlJs, {
  Database,
  SqlJsStatic,
} from 'sql.js';

import { PersistedEntityBase } from '../entity/PersistedEntityBase';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';
import { IProviderConfig } from '../interface/IProviderConfig';

export class SQLLiteSchemeProvider implements IOfflineStorageProvider {
    
    /**
     * Saves the current state or data to the storage provider.
     *
     * @returns A promise that resolves when the save operation is complete.
     * @throws An error if the method is not implemented.
     */
    save(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    /**
     * Finds and retrieves items from the storage based on a label and a query function.
     * Optionally, specific keys can be picked from the resulting items.
     *
     * @template T - The type of the persisted entity.
     * @template K - The keys of the entity to pick, defaults to all keys of T.
     * 
     * @param label - The label identifying the collection of items to search.
     * @param query - A function used to filter items. Should return `true` for items to include.
     * @param pickKeys - An optional array of keys to pick from the filtered items. If not provided, all keys are included.
     * 
     * @returns A promise that resolves to an array of objects containing the picked keys from the filtered items.
     */
    async find<T extends PersistedEntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<Array<Pick<T, K>>> {
        const allItems = await this.all<T>(label);
        const filteredItems = allItems.filter(query);
    
        if (!pickKeys) {
            return filteredItems as Array<Pick<T, K>>;
        }
    
        return filteredItems.map((item) => {
            const result = {} as Pick<T, K>;
            for (const key of pickKeys) {
                result[key] = item[key];
            }
            return result;
        });
    }

    
    /**
     * Retrieves a map of collections from the storage provider.
     *
     * @returns {Promise<Map<string, any>>} A promise that resolves to a map where the keys are collection names
     * and the values are the corresponding collection data.
     * @throws {Error} If the method is not implemented.
     */
    getCollections(): Promise<Map<string, any>> {
        throw new Error("Method not implemented.");
    }
    /**
     * Adds a new collection to the storage provider.
     *
     * @template T - The type of entities in the collection, extending `PersistedEntityBase`.
     * @param label - A string representing the label or name of the collection.
     * @param collection - The collection to be added, typically an object or data structure.
     * @throws {Error} If the method is not implemented.
     */
    addCollection<T extends PersistedEntityBase>(label: string, collection: any): void {
        throw new Error("Method not implemented.");
    }
    ["constructor"](config?: IProviderConfig): IOfflineStorageProvider {
        throw new Error("Method not implemented.");
    }
    private db: Database | undefined;
    private SQL: SqlJsStatic | undefined;

    /**
     * Initializes the SQLite database with the specified storage name.
     * This method sets up the SQL.js environment and creates a new in-memory database instance.
     *
     * @param storageName - The name of the storage to initialize. This parameter is currently unused.
     * @returns A promise that resolves when the initialization is complete.
     */
    async init(storageName: string,data?: ArrayLike<number> | Buffer | null): Promise<void> {
        this.SQL = await initSqlJs({ locateFile: file => `./js/${file}` });
        this.db = new this.SQL.Database(data || new Uint8Array());
    }

    /**
     * Infers a database schema from a given object by mapping its properties
     * to corresponding SQLite data types based on their JavaScript types.
     *
     * @template T - The type of the input object.
     * @param item - The object from which to infer the schema.
     * @returns A record where the keys are the property names of the input object
     * and the values are SQLite data types (`REAL`, `INTEGER`, or `TEXT`).
     *
     * - `REAL` is assigned for properties with a `number` type.
     * - `INTEGER` is assigned for properties with a `boolean` type.
     * - `TEXT` is assigned for all other types.
     */
    private inferSchema<T>(item: T): Record<string, string> {
        const schema: Record<string, string> = {};
        for (const key in item) {
            const value = (item as any)[key];
            schema[key] = typeof value === 'number'
                ? 'REAL'
                : typeof value === 'boolean'
                ? 'INTEGER'
                : 'TEXT';
        }
        return schema;
    }

    /**
     * Ensures that a table with the specified label exists in the database.
     * If the table does not exist, it creates the table using the inferred schema
     * from the provided item.
     *
     * @template T - The type of the item used to infer the schema.
     * @param label - The name of the table to ensure or create.
     * @param item - An example item used to infer the schema for the table.
     * @returns A promise that resolves when the table is ensured or created.
     */
    private async ensureTable<T>(label: string, item: T): Promise<void> {
        const schema = this.inferSchema(item);
        const columns = Object.entries(schema)
            .map(([k, t]) => `${k} ${k === 'id' ? `${t} PRIMARY KEY` : t}`)
            .join(', ');
        this.db!.run(`CREATE TABLE IF NOT EXISTS ${label} (${columns})`);
    }

    /**
     * Updates or inserts an entity into the specified table in the SQLite database.
     * If the entity already exists (based on its primary key), it will be replaced.
     * 
     * @template T - A type that extends `PersistedEntityBase`, representing the entity to be updated.
     * @param label - The name of the table where the entity will be stored.
     * @param item - The entity to be updated or inserted into the table.
     * @returns A promise that resolves when the operation is complete.
     * 
     * @remarks
     * This method ensures that the table exists before performing the operation.
     * It constructs an `INSERT OR REPLACE` SQL statement dynamically based on the keys of the provided entity.
     * The `values` array is populated with the corresponding values of the entity's properties.
     * 
     * @throws Will throw an error if the database connection (`this.db`) is not initialized.
     */
    async update<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        await this.ensureTable(label, item);
        const keys = Object.keys(item);
        const placeholders = keys.map(() => '?').join(', ');
        const stmt = `INSERT OR REPLACE INTO ${label} (${keys.join(',')}) VALUES (${placeholders})`;
        const values = keys.map(k => (item as any)[k]);
        this.db!.run(stmt, values);
    }

    /**
     * Retrieves an entity of type `T` from the database by its ID.
     *
     * @template T - The type of the entity to retrieve, extending `PersistedEntityBase`.
     * @param label - The name of the table or label where the entity is stored.
     * @param id - The unique identifier of the entity to retrieve. Can be a string or a number.
     * @returns A promise that resolves to the entity of type `T` if found, or `undefined` if no entity is found.
     */
    async findById<T extends PersistedEntityBase>(label: string, id: string | number): Promise<T | undefined> {
        const stmt = this.db!.prepare(`SELECT * FROM ${label} WHERE id = ?`);
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            return row as unknown as T;
        }
        return undefined;
    }

    /**
     * Retrieves all records from the specified table in the database.
     *
     * @template T - The type of the entities being retrieved, extending `PersistedEntityBase`.
     * @param label - The name of the table to query.
     * @returns A promise that resolves to an array of entities of type `T`.
     * @throws Will throw an error if the database connection is not initialized.
     */
    async all<T extends PersistedEntityBase>(label: string): Promise<T[]> {
        const stmt = this.db!.prepare(`SELECT * FROM ${label}`);
        const results: T[] = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject() as unknown as T);
        }
        return results;
    }

    /**
     * Deletes an entity from the database based on its label and ID.
     *
     * @template T - The type of the entity, extending `PersistedEntityBase`.
     * @param label - The name of the table or label associated with the entity.
     * @param item - The entity to be deleted, which must have a defined `id` property.
     * @returns A promise that resolves when the deletion is complete.
     * @throws {Error} If the `id` property of the entity is undefined.
     */
    async delete<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        if (item.id === undefined) {
            throw new Error("Item ID is undefined.");
        }
        this.db!.run(`DELETE FROM ${label} WHERE id = ?`, [item.id]);
    }
}
