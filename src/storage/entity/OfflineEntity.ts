import { DefaultFormatter } from '../formaters/DefaultFormatter';
import { ModelDefinition } from '../ModelDefinition';
import { EntityBase } from './EntityBase';

export abstract class OfflineEntity<T extends EntityBase> extends EntityBase {
    protected modelDefinition?: ModelDefinition<T>;

    constructor(definition?: ModelDefinition<T>) {
        super();
        this.modelDefinition = definition;
    }

    protected format<K extends keyof T>(key: K, value: T[K]): any {
        if (this.modelDefinition && this.modelDefinition.formatters && this.modelDefinition.formatters[key]) {
            return this.modelDefinition.formatters[key]!.format(value);
        }
        return new DefaultFormatter<T[K]>().format(value);
    }

    protected parse<K extends keyof T>(key: K, value: any): T[K] {
        if (this.modelDefinition && this.modelDefinition.formatters && this.modelDefinition.formatters[key]) {
            return this.modelDefinition.formatters[key]!.parse(value);
        }
        return new DefaultFormatter<T[K]>().parse(value);
    }

    toJSON(): any {
        const json: any = { ...this };
        if (this.modelDefinition && this.modelDefinition.formatters) {
            for (const key in this.modelDefinition.formatters) {
                if (this.hasOwnProperty(key)) {
                    json[key] = this.format(key, (this as unknown as T)[key]);
                }
            }
        }
        return json;
    }

    fromJSON(json: any): void {
        for (const key in json) {
            if (this.hasOwnProperty(key)) {
                if (this.modelDefinition?.formatters && key in this.modelDefinition.formatters) {
                    this[key as keyof this] = this.parse(key as keyof T, json[key]) as unknown as this[keyof this];
                } else {
                    // Handle properties without formatters
                    if (json[key] !== undefined) {
                        this[key as keyof this] = json[key] as this[keyof this];
                    }
                }
            }
        }
    }
}