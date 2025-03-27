import { IFormatter } from '../interface/IFormatter';

export class DefaultFormatter<T> implements IFormatter<T> {
    format(value: T): any {
        console.log('DefaultFormatter format', value);
        return value;
    }

    parse(value: any): T {
        console.log('DefaultFormatter parse', value);
        return value as T;
    }
}
