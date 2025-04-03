export interface IInterceptor {
    init(dbName: string): Promise<void>;
    update<T>(collectionName: string, item: T): Promise<T>;
    delete<T>(collectionName: string, item: T): Promise<void>;
    all<T>(collectionName: string): Promise<T[]>;
    findById<T>(collectionName: string, id: number): Promise<T | null>;
    find<T>(collectionName: string, query: (item: T) => boolean, pickKeys?: (keyof T)[]): Promise<T[]>;
    updateAll<T>(collectionName: string, predicate: (item: T) => boolean, update: (item: T) => void): Promise<void>;
    deleteMany<T>(collectionName: string, predicateOrItems: ((item: T) => boolean) | T[]): Promise<void>;
}
