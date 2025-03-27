import { IFormatter } from './interface/IFormatter';

export interface ModelDefinition<T> {
    formatters?: {
        [key in keyof T]?: IFormatter<T[key]>;
    };
}
