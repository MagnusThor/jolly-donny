import {
  LocalStorageProvider,
  OfflineStorage,
  QueryableArray,
} from '../src/index';
import { ExtendedDish } from './fake-api/ExtendedDish';
import { IExtendedDish } from './fake-api/IExtendedDish';
import {
  IDish,
  IMenu,
} from './fake-api/MenuModel';

export class TestClint {
    storage!: OfflineStorage;
   

    async runCommands() {

        const extendedDishes = await OfflineStorage.fetch<IMenu,IExtendedDish[]>('fake-api/data.json', (result) => {
            const dishes = new QueryableArray(...result.dishes);
            const categories = new QueryableArray(...result.categories);    
            const extendedDishes = dishes.map((dish) => {
                const category = categories.find((cat) => cat.id === dish.category);
                const extendedDish = new ExtendedDish();          
                Object.assign<ExtendedDish,IDish>(extendedDish, dish);    
                extendedDish.categoryName = category ? category.name : 'Unknown';
                return extendedDish;
            });
            return extendedDishes; 
        });
           
        extendedDishes.forEach(async (dish) => {
            const existingDish = await this.storage.find<ExtendedDish>('dishStorage', (d) => d.uuid === dish.uuid);
            if (existingDish.length == 0) {
                await this.storage.insert('dishStorage', dish);
            }
        });   
         const collection = await this.storage.getCollection<ExtendedDish>('dishStorage').toArray();
         collection.forEach ( item => {
                    console.log(item);
         });
    }
    
    constructor() {

        const provider = new LocalStorageProvider();
        //const provider = new IndexedDBProvider


        this.storage = new OfflineStorage(provider, 'dishStorage');
        this.storage.init().then(async () => {
            console.log('Storage initialized');
            await this.runCommands();
        }
        ).catch(async () => {
            console.log('Storage initialization failed, creating new storage');
            this.storage.addCollection<IExtendedDish>('dishStorage');
            this.storage.save();
            await this.runCommands();
        });


    }

   
}

document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()





});