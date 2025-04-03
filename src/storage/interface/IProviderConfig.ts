import { IInterceptor } from './IInterceptor';

/**
 * Represents the configuration options for a provider.
 *
 * @property {IInterceptor} [interceptor] - An optional interceptor that can be used to modify or handle requests and responses.
 * @property {any} [key: string] - Additional properties that can be dynamically added to the configuration.
 */
export interface IProviderConfig {
    interceptor?: IInterceptor;
    [key: string]: any; 
}
