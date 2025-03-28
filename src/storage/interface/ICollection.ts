/**
 * Represents a generic collection interface.
 *
 * @template T - The type of elements contained in the collection.
 * @property label - A string label that identifies the collection.
 * @property collection - An array of items of type `T` that belong to the collection.
 */
export interface ICollection<T> {
    label: string;
    collection: Array<T>;
}
