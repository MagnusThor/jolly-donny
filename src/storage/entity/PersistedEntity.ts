import { DefaultFormatter } from '../formaters/DefaultFormatter';
import { IFormatter } from '../interface/IFormatter';
import { PersistedEntityBase } from './EntityBase';
import { PersistedEntityBuilder } from './PersistedEntityBuilder';

/**
 * An abstract base class that extends `PersistedEntityBase` to provide functionality for handling
 * offline entities with customizable formatting and parsing logic. This class is designed
 * to work with an optional entity definition (`IEntityDefinition`) that specifies how
 * properties of the entity should be formatted and parsed.
 *
 * @template T - The type of the entity that extends `PersistedEntityBase`.
 *
 * @extends PersistedEntityBase
 */
export abstract class PersistedEntity<T extends PersistedEntity<T>> extends PersistedEntityBase  {
 

    protected entityDefinition?: { formatters: { [key in keyof T]?: IFormatter<T[key]> } };


    constructor(builder?: PersistedEntityBuilder<T>) {
        super();
        this.entityDefinition = builder?.build();
       
    }

    /**
     * Formats the value of a given key in the entity using a specific formatter.
     * If a custom formatter is defined for the key in the entity definition, it will be used.
     * Otherwise, a default formatter will be applied.
     *
     * @template K - The type of the key in the entity.
     * @param key - The key of the entity whose value needs to be formatted.
     * @param value - The value associated with the key to be formatted.
     * @returns The formatted value.
     */
    protected format<K extends keyof T>(key: K, value: T[K]): any {
        if (this.entityDefinition && this.entityDefinition.formatters && this.entityDefinition.formatters[key]) {
            return this.entityDefinition.formatters[key]!.format(value);
        }
        return new DefaultFormatter<T[K]>().format(value);
    }

    /**
     * Parses a given value using a formatter associated with the specified key.
     * If a custom formatter is defined for the key in the entity definition, it will be used.
     * Otherwise, a default formatter will be used to parse the value.
     *
     * @template K - A key of the generic type `T`.
     * @param key - The key for which the value is being parsed.
     * @param value - The value to be parsed.
     * @returns The parsed value of type `T[K]`.
     */
    protected parse<K extends keyof T>(key: K, value: any): T[K] {
        if (this.entityDefinition && this.entityDefinition.formatters && this.entityDefinition.formatters[key]) {
            return this.entityDefinition.formatters[key]!.parse(value);
        }
        return new DefaultFormatter<T[K]>().parse(value);
    }

  
    /**
     * Converts the current entity instance into a JSON representation.
     * 
     * This method creates a partial copy of the entity, including all its properties.
     * If the entity has a defined `entityDefinition` with custom formatters, it applies
     * those formatters to the corresponding properties before including them in the JSON output.
     * 
     * @returns A partial JSON representation of the entity with optional formatting applied.
     */
    toJSON(): Partial<T> {
        const json: Partial<T> = { ...(this as unknown as Partial<T>) };
        if (this.entityDefinition && this.entityDefinition.formatters) {
            for (const key in this.entityDefinition.formatters) {
                if (this.hasOwnProperty(key)) {
                    json[key as keyof T] = this.format(key, (this as unknown as T)[key]);
                }
            }
        }
        return json;
    }
   
    
    /**
     * Populates the current instance with values from a given JSON object.
     * 
     * @template T - The type of the entity being populated.
     * @param json - A partial JSON object containing the properties to populate.
     * 
     * The method iterates over the keys in the provided JSON object and assigns
     * values to the corresponding properties of the current instance if they exist.
     * 
     * - If the `entityDefinition.formatters` is defined and contains a formatter for the key,
     *   the value is parsed using the `parse` method before assignment.
     * - If no formatter is defined, the value is directly assigned if it is not `undefined`.
     * 
     * Type assertions are used to ensure compatibility between the JSON object and the
     * instance properties.
     */
    fromJSON(json: Partial<T>): void {
        for (const key in json) {
            if (this.hasOwnProperty(key)) {
                if (this.entityDefinition?.formatters && key in this.entityDefinition.formatters) {
                    this[key as keyof this] = this.parse(key as keyof T, json[key]) as unknown as this[keyof this]; // Type assertion
                } else {
                    if (json[key] !== undefined) {
                        this[key as keyof this] = json[key] as this[keyof this]; // Type assertion
                    }
                }
            }
        }
    }

}