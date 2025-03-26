

/**
 * Represents an offline graph structure with a label and a collection of items.
 *
 * @template T - The type of elements contained in the collection.
 * @property {string} label - A descriptive label for the graph.
 * @property {Array<T>} collection - An array of items representing the graph's data.
 */
export interface IOfflineGraph<T> {
    label: string;
    collection: Array<T>;
}
