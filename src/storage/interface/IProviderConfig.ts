import { IInterceptor } from './IInterceptor';
import { IOfflineStorageProvider } from './IOfflineStorageProvider';

/**
 * Represents the configuration options for a provider.
 *
 * @property {IInterceptor} [interceptor] - An optional interceptor that can be used to modify or handle requests and responses.
 * @property {any} [key: string] - Additional properties that can be dynamically added to the configuration.
 */
export interface IProviderConfig {
    interceptor?: IInterceptor;
    parser?: ParserFunction;
    [key: string]: any; 
}



/**
 * A function type that parses content and returns a map of parsed results.
 *
 * @param content - The string content to be parsed.
 * @param providerInstance - An instance of the offline storage provider.
 * @param loadedResults - Any preloaded results that may assist in parsing.
 * @returns A map where keys are strings and values are the parsed data.
 */
export type ParserFunction = (
    content: string,
    providerInstance: IOfflineStorageProvider,
    loadedResults:  any
) => Map<string, any>;