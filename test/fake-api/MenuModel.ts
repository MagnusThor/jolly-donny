
export interface IMenu {
    _id: string;
    categories: ICategory[];
    dishes: IDish[];
    uuid: string;
    useLimited: null;
}

export interface ICategory {
    uuiid?: string;
    id: number;
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

