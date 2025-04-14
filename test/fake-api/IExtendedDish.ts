import { IPersistedEntity } from '../../src/index';

export interface IMenu {
    _id: string;
    categories: ICategory[];
    dishes: IDish[];
    uuid: string;
    useLimited: null;
}

export interface ICategory {
    id: number | string | undefined; // Changed 'id' to 'number | string | undefined' to match the original type
    uuiid?: string;
    categoryId: number; // Renamed 'id' to 'categoryId' to avoid conflict
    name: string;
    uuid: string;
}

export interface IDish {
    category: number;
    title: string;
    price: number;
    sku: number;
    description: string;
    uuid: string;
    showInLimied: boolean;
}


export interface IExtendedDish extends IPersistedEntity, IDish {

    dishCategory: ICategory | undefined;
}

export interface IExendedCategory extends IPersistedEntity, ICategory {

   
}
