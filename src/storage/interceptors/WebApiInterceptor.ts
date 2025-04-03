import { IInterceptor } from '../interface/IInterceptor';
import { IWebApiConfig } from '../interface/IWebApiConfig';

export class WebApiInterceptor implements IInterceptor {
    private config: IWebApiConfig;

    constructor(config: IWebApiConfig) {
        this.config = config;
    }

    /**
     * Initializes the Web API interceptor with the specified database name.
     *
     * @param dbName - The name of the database to initialize the interceptor with.
     * @returns A promise that resolves when the initialization is complete.
     */
    async init(dbName: string): Promise<void> {
        console.log(`Http Provider initialized with base URL: ${this.config.baseUrl}`);
    }

    /**
     * Makes an HTTP request to the specified URL using the Fetch API and returns the parsed JSON response.
     * 
     * @template T - The expected type of the response data.
     * @param url - The endpoint to which the request is sent, relative to the base URL.
     * @param options - The configuration options for the fetch request, such as method, headers, and body.
     * @returns A promise that resolves to the parsed JSON response of type `T`.
     * @throws An error if the HTTP response status is not OK (status code outside the range 200-299).
     */
    private async apiFetch<T>(url: string, options: RequestInit): Promise<T> {
        const response = await fetch(`${this.config.baseUrl}/${url}`, {
            ...options,
            headers: {
                ...this.config.headers,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Updates an item in the specified collection by sending a PUT request to the API.
     *
     * @template T - The type of the item to be updated.
     * @param collectionName - The name of the collection where the item resides.
     * @param item - The item to be updated. It must include a `uuid` property to identify it.
     * @returns A promise that resolves to the updated item of type `T`.
     */
    async update<T>(collectionName: string, item: T): Promise<T> {
        return await this.apiFetch<T>(`${collectionName}/${(item as any).uuid}`, {
            method: 'PUT',
            body: JSON.stringify(item),
        });
    }

    /**
     * Deletes an item from the specified collection in the web API.
     *
     * @template T - The type of the item to be deleted.
     * @param collectionName - The name of the collection from which the item will be deleted.
     * @param item - The item to be deleted. It is expected to have a `uuid` property.
     * @returns A promise that resolves when the deletion is complete.
     */
    async delete<T>(collectionName: string, item: T): Promise<void> {
        await this.apiFetch<void>(`${collectionName}/${(item as any).uuid}`, {
            method: 'DELETE',
        });
    }

    /**
     * Retrieves all items from the specified collection.
     *
     * @template T - The type of the items in the collection.
     * @param collectionName - The name of the collection to fetch items from.
     * @returns A promise that resolves to an array of items of type `T`.
     */
    async all<T>(collectionName: string): Promise<T[]> {
        return await this.apiFetch<T[]>(`${collectionName}`, {
            method: 'GET',
        });
    }

    /**
     * Retrieves an item by its ID from the specified collection.
     *
     * @template T - The type of the item to be retrieved.
     * @param {string} collectionName - The name of the collection to query.
     * @param {number} id - The unique identifier of the item to retrieve.
     * @returns {Promise<T | null>} A promise that resolves to the item if found, or `null` if not found.
     */
    async findById<T>(collectionName: string, id: number): Promise<T | null> {
        return await this.apiFetch<T | null>(`${collectionName}/${id}`, {
            method: 'GET',
        });
    }

    async find<T>(collectionName: string, query: (item: T) => boolean, pickKeys?: (keyof T)[]): Promise<T[]> {
       throw "Not yet implemented";
    }

    /**
     * Updates all items in the specified collection that match the given predicate.
     *
     * @template T - The type of the items in the collection.
     * @param collectionName - The name of the collection to update.
     * @param predicate - A function that determines whether an item should be updated.
     *                     It takes an item of type `T` as input and returns a boolean.
     * @param update - A function that applies the desired updates to an item.
     *                 It takes an item of type `T` as input and modifies it in place.
     * @returns A promise that resolves when the update operation is complete.
     */
    async updateAll<T>(collectionName: string, predicate: (item: T) => boolean, update: (item: T) => void): Promise<void> {

        await this.apiFetch<void>(`${collectionName}/updateAll`, {
            method: 'POST',
            body: JSON.stringify({ predicate, update }),
        });
    }

    /**
     * Deletes multiple items from a specified collection in the storage.
     *
     * @template T - The type of the items in the collection.
     * @param collectionName - The name of the collection from which items will be deleted.
     * @param predicateOrItems - A predicate function to filter items for deletion or an array of items to delete.
     *   - If a predicate function is provided, it will be applied to each item in the collection to determine if it should be deleted.
     *   - If an array of items is provided, those specific items will be deleted.
     * @returns A promise that resolves when the deletion operation is complete.
     */
    async deleteMany<T>(collectionName: string, predicateOrItems: ((item: T) => boolean) | T[]): Promise<void> {
        await this.apiFetch<void>(`${collectionName}/deleteMany`, {
            method: 'POST',
            body: JSON.stringify({ predicateOrItems }),
        });
    }
}
