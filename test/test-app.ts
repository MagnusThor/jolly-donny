import {
  IProviderConfig,
  LocalStorageProvider,
  OfflineStorage,
  QueryableArray,
  WebApiInterceptor,
} from '../src/index';
import { ExtendedDish } from './fake-api/ExtendedDish';
import { IExtendedDish } from './fake-api/IExtendedDish';
import {
  IDish,
  IMenu,
} from './fake-api/MenuModel';

const logger = (data:any) => {

        const p = document.createElement("p");
        p.textContent = JSON.stringify(data);

        document.querySelector("#output")?.prepend(p);

};

export class TestClint {
    storage!: OfflineStorage;
   

    async runCommands() {

        const extendedDishes = await OfflineStorage.fetch<IMenu,IExtendedDish[]>('api/menu/', (result) => {
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
            logger(item);
                   
         });
    }
    
    constructor() {


        const providerConfig:IProviderConfig = {
            interceptor:new WebApiInterceptor({
                baseUrl:"/api/"
            })
        };

        const provider = new LocalStorageProvider(providerConfig);
        //const provider = new IndexedDBProvider

        this.storage = new OfflineStorage(provider, 'dishStorage');
        this.storage.init().then(async () => {
            logger('Storage initialized');
            await this.runCommands();
        }
        ).catch(async () => {
            logger('Storage initialization failed, creating new storage');
            this.storage.addCollection<IExtendedDish>('dishStorage');
            this.storage.save();
            await this.runCommands();
        });
    }

   
}

document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()

});