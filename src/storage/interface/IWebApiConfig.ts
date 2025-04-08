import { IProviderConfig } from './IProviderConfig';

/**
 * Represents the configuration settings for a web API provider.
 * Extends the `IProviderConfig` interface to include additional
 * properties specific to web API interactions.
 *
 * @extends IProviderConfig
 *
 * @property {string} baseUrl - The base URL of the web API.
 * @property {Record<string, string>=} headers - Optional HTTP headers
 * that should be included in requests to the web API.
 */
export interface IWebApiConfig extends IProviderConfig {
    baseUrl: string;
    headers?: Record<string, string>;
    endPoints?: {
        update?: IWebAPIEndpointConfig;
        delete?: IWebAPIEndpointConfig;
        findById?: IWebAPIEndpointConfig;
        find?: IWebAPIEndpointConfig;
        all?: IWebAPIEndpointConfig;
    };
}


export interface IWebAPIEndpointConfig {
    url?: string;
    method?: string;
}
