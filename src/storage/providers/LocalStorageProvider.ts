import { PersistedEntityBase } from '../entity/EntityBase';
import { IOfflineStorageProvider } from '../interface/IOfflineStorageProvider';

export class LocalStorageProvider implements IOfflineStorageProvider {
    private models: Map<string, any> = new Map();
    private storageName!: string;

    async init(storageName: string): Promise<void> {
        this.storageName = storageName;
        await this.deSerialize();
    }

    async save(): Promise<void> {
        return new Promise<void>((resolve) => {
            const data = this.serialize();
            localStorage.setItem(this.storageName, data);
            resolve();
        });
    }

    async update<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const model = this.models.get(label);
        if (model) {
            const index = model.collection.findIndex((pre: T) => pre.id === item.id);
            if (index !== -1) {
                item.lastModified = Date.now();
                model.collection[index] = item;
            }else{
                model.collection.push(item);
            }
            
        }
        await this.save();
    }

    async delete<T extends PersistedEntityBase>(label: string, item: T): Promise<void> {
        const model = this.models.get(label);
        if (model) {
            const index = model.collection.findIndex((pre: T) => pre.id === item.id);
            if (index !== -1) {
                model.collection.splice(index, 1);
            }
        }
        await this.save();
    }

    async findById<T extends PersistedEntityBase>(label: string, uuid: string): Promise<T | undefined> {
        const model = this.models.get(label);
        if (model) {
            return model.collection.find((pre: T) => pre.id === uuid);
        }
        return undefined;
    }

    async find<T extends PersistedEntityBase, K extends keyof T = keyof T>(
        label: string,
        query: (item: T) => boolean,
        pickKeys?: K[]
    ): Promise<Array<Pick<T, K>>> {
        const model = this.models.get(label);
        if (!model) {
            return [];
        }

        const filteredItems = model.collection.filter(query) as T[];

        if (pickKeys) {
            return filteredItems.map((item) => {
                const result: Pick<T, K> = {} as Pick<T, K>;
                pickKeys.forEach((key) => {
                    if (key in item) {
                        result[key] = item[key];
                    }
                });
                return result;
            });
        } else {
            return filteredItems;
        }
    }

    async all<T extends PersistedEntityBase>(label: string): Promise<Array<T>> {
        const model = this.models.get(label);
        if (model) {
            return model.collection;
        }
        return [];
    }

    async getCollections(): Promise<Map<string, any>> {
        return Promise.resolve(this.models);
    }


    addCollection<T extends PersistedEntityBase>(label: string, model: any): void {
        this.models.set(label, model);
    }

    private serialize(): string {
        return JSON.stringify(Array.from(this.models.entries()));
    }

    private async deSerialize(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const data = localStorage.getItem(this.storageName);
            if (!data) {
                reject(new Error('No data found'));
                return;
            }
            try {
                const parsedData = JSON.parse(data);
                this.models = new Map(parsedData);
                resolve();
            } catch (e) {
                reject(new Error('Error parsing data'));
            }
        });
    }
}