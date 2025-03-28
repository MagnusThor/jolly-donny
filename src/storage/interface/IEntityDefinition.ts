import { IFormatter } from './IFormatter';

export interface IEntityDefinition<T> {
    formatters?: {
        [key in keyof T]?: IFormatter<T[key]>;
    };
}
