import { IPersistedEntity } from '../interface/IPersistedEntity ';

/**
 * Represents the base class for entities, providing common properties and functionality
 * for offline entities.
 *
 * @template TId The type of the unique identifier (e.g., string, number, or undefined).
 * @implements {IPersistedEntity<TId>}
 */
export abstract class PersistedEntityBase<TId extends string | number  = string | number > 
implements IPersistedEntity{
    /**
     * The unique identifier for the entity.
     */
    id: TId;

    /**
     * The timestamp (in milliseconds) when the entity was created.
     */
    created: number;

    /**
     * The timestamp (in milliseconds) when the entity was last modified.
     */
    lastModified: number;

    /**
     * Creates an instance of `PersistedEntityBase`.
     *
     * @param {TId extends (string | number) ? TId : string | number} [id] - The unique identifier for the entity. If not provided, a UUID will be generated.
     */
    constructor(id?: TId extends (string | number) ? TId : string | number) {
        // We cast the generated UUID to TId to satisfy the type constraint.
        // If TId is more restrictive than string | number, sub-classes will need to ensure consistency.
        this.id = (id || crypto.randomUUID()) as TId;
        this.created = Date.now();
        this.lastModified = Date.now();
    }
}



export class EntityHelper {
    /**
     * Converts a plain object into an entity that extends `PersistedEntityBase`.
     * Ensures that the `id`, `created`, and `lastModified` properties are set.
     *
     * @template T - The type of the input object, which must have an optional `id` property.
     * @param {T} data - The plain object to be converted into an entity.
     * @returns {T & PersistedEntityBase} A new object that combines the input data with the properties of `PersistedEntityBase`.
     */
    static to<T extends { id?: string | number; }>(data: T): T & PersistedEntityBase {
        // 1. Instantiate the base entity to get default id, created, lastModified
        class ConcretePersistedEntity extends PersistedEntityBase { }
        const base = new ConcretePersistedEntity();

        // 2. Ensure the ID is explicitly converted to string before merging
        const finalId = data.id !== undefined
            ? data.id.toString()
            : base.id;

        // 3. Merge and cast the result
        return {
            ...data,
            id: finalId, // Now guaranteed to be a string
            created: base.created,
            lastModified: base.lastModified
        } as T & PersistedEntityBase; // Use a final assertion if necessary
    }

    /**
     * Creates a new instance of a class that extends `PersistedEntityBase` by merging the provided data
     * with default values for `id`, `created`, and `lastModified` properties if they are not already set.
     *
     * @template T - The type of the object extending `PersistedEntityBase`.
     * @param {T & Partial<PersistedEntityBase>} data - An object containing the properties to initialize the entity.
     *                                                  It may include partial properties of `PersistedEntityBase`.
     * @returns {T & PersistedEntityBase} A new object that combines the provided data with default values for
     *                                    `id`, `created`, and `lastModified` properties.
     */
    static from<T extends object>(data: T & Partial<PersistedEntityBase>): T & PersistedEntityBase {
        return {
            ...data,
            id: data.id ?? crypto.randomUUID(),
            created: data.created ?? Date.now(),
            lastModified: data.lastModified ?? Date.now()
        };
    }

    /**
     * Updates the `lastModified` property of the given entity to the current timestamp.
     *
     * @template T - A type that extends `PersistedEntityBase`.
     * @param {T} entity - The entity to be updated.
     * @returns {T} A new entity object with the updated `lastModified` timestamp.
     */
    static touch<T extends PersistedEntityBase>(entity: T): T {
        return {
            ...entity,
            lastModified: Date.now()
        };
    }
}
