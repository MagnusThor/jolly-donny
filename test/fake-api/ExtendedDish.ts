import { PersistedEntity } from '../../src/index';
import {
  ICategory,
  IExtendedDish,
} from './IExtendedDish';

export class ExtendedDish extends PersistedEntity<ExtendedDish> implements IExtendedDish {
    created: number;
    lastModified: number;
    constructor() {
        super();
        this.created = Date.now();
        this.lastModified = Date.now();

    }
    dishCategory: ICategory | undefined;
    categoryName!: string;
    category!: number;
    title!: string;
    price!: number;

    sku!: number;
    description!: string;
    uuid!: string;
    showInLimied!: boolean;
}
