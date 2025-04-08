export interface IInterceptor {
    init(dbName: string): Promise<void>;
    update<T>(collectionName: string, item: T, url?: string, method?: string): Promise<T>;
    delete<T>(collectionName: string, item: T, url?: string, method?: string): Promise<void>;
    all<T>(collectionName: string, url?: string, method?: string): Promise<T[]>;
    findById<T>(collectionName: string, id: number | string, url?: string, method?: string): Promise<T | null>;
    find<T>(collectionName: string, query: (item: T, url?: string, method?: string) => boolean, pickKeys?: (keyof T)[]): Promise<T[]>;
    updateAll<T>(collectionName: string, predicate: (item: T, url?: string, method?: string) => boolean, update: (item: T) => void): Promise<void>;
    deleteMany<T>(collectionName: string, predicateOrItems: ((item: T) => boolean) | T[], url?: string, method?: string): Promise<void>;
}

