import { IPersistedEntity } from '../interface/IPersistedEntity ';

/**
 * Represents the base class for entities, providing common properties and functionality
 * for offline entities.
 *
 * @implements {IPersistedEntity }
 */
export class PersistedEntityBase implements IPersistedEntity  {

    id: string | number | undefined;
    created: number;
    lastModified: number;

    constructor(id?: string | number) {
        this.id = id  || crypto.randomUUID(); 
        this.created = Date.now();
        this.lastModified = Date.now();
    }

  
}
/**
 * A utility class that provides helper methods for working with entities
 * that extend the `PersistedEntityBase` class. These methods facilitate
 * the conversion of plain objects to entities and vice versa, ensuring
 * that essential properties like `id`, `created`, and `lastModified` are
 * properly initialized.
 */
export class EntityHelper {
    /**
     * Converts a plain object into an entity that extends `PersistedEntityBase`.
     * Ensures that the `id`, `created`, and `lastModified` properties are set.
     *
     * @template T - The type of the input object, which must have an optional `id` property.
     * @param data - The plain object to be converted into an entity.
     * @returns A new object that combines the input data with the properties of `PersistedEntityBase`.
     */
    static to<T extends { id?: string | number }>(data: T): T & PersistedEntityBase {
        const base = new PersistedEntityBase(data.id);
        return {
            ...data,
            id: data.id ?? base.id,
            created: base.created,
            lastModified: base.lastModified
        };
    }

    /**
     * Creates a new instance of a class that extends `PersistedEntityBase` by merging the provided data
     * with default values for `id`, `created`, and `lastModified` properties if they are not already set.
     *
     * @template T - The type of the object extending `PersistedEntityBase`.
     * @param data - An object containing the properties to initialize the entity. 
     *               It may include partial properties of `PersistedEntityBase`.
     * @returns A new object that combines the provided data with default values for 
     *          `id`, `created`, and `lastModified` properties.
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
     * @param entity - The entity to be updated.
     * @returns A new entity object with the updated `lastModified` timestamp.
     */
    static touch<T extends PersistedEntityBase>(entity: T): T {
        return {
            ...entity,
            lastModified: Date.now()
        };
    }

}