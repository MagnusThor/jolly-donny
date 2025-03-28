import { IFormatter } from '../interface/IFormatter';

/**
 * A generic builder class for managing and applying formatters to the properties of an entity.
 *
 * @template T - The type of the entity for which formatters are being managed.
 *
 * This class allows you to add formatters for specific keys of an entity and retrieve
 * the collection of formatters in a structured format. It is designed to facilitate
 * the customization of how individual properties of an entity are processed or displayed.
 *
 * Example usage:
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 * }
 *
 * const builder = new PersistedEntityBuilder<User>();
 * builder.addFormatter('name', new StringFormatter());
 * builder.addFormatter('age', new NumberFormatter());
 *
 * const result = builder.build();
 * console.log(result.formatters.name); // Outputs the formatter for 'name'
 * console.log(result.formatters.age);  // Outputs the formatter for 'age'
 * ```
 */
export class PersistedEntityBuilder<T> {
    private formatters: {
        [key in keyof T]?: IFormatter<T[key]>;
    } = {};

    /**
     * Adds a formatter for a specific key in the entity.
     *
     * @template K - The type of the key in the entity.
     * @param key - The key for which the formatter is being added.
     * @param formatter - The formatter to process the value associated with the specified key.
     * @returns The current instance of the builder for method chaining.
     */
    addFormatter<K extends keyof T>(key: K, formatter: IFormatter<T[K]>): this {
        this.formatters[key] = formatter;
        return this;
    }

    /**
     * Builds and returns an object containing formatters for the properties of type `T`.
     *
     * @returns An object with a `formatters` property, where each key corresponds to a property
     *          of type `T` and its value is an optional `IFormatter` for that property.
     */
    build(): {
        formatters: {
            [key in keyof T]?: IFormatter<T[key]>;
        };
    } {
        return { formatters: this.formatters };
    }
}
