import { IPersistedEntity } from '../../src/index';
import { IDish } from './MenuModel';

export interface IExtendedDish extends IPersistedEntity, IDish {
    categoryName: string;
}
