
/**
 * Represents an entity that is stored offline with basic metadata.
 */
export interface IPersistedEntity  {
    id: string | number | undefined;
    created: number;
    lastModified: number;
}
