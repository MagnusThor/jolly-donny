
export interface IFormatter<T> {
    format(value: T): any;
    parse(value: any): T;
}
