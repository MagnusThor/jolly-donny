import {
  IProviderConfig,
  LocalStorageProvider,
  OfflineStorage,
  QueryableArray,
} from '../src/index';
import {
  IDish,
  IExtendedDish,
  IMenu,
} from './fake-api/IExtendedDish';

const logger = (...args: any[]) => {

        const p = document.createElement("p");
        p.textContent = JSON.stringify(args);

        document.querySelector("#output")?.prepend(p);

};

export class TestClint {
    storage!: OfflineStorage;

    async importData():Promise<number> {
        logger('Importing data...');        
        const extendedDishes = await OfflineStorage.fetch<IMenu,IExtendedDish[]>('fake-api/data.json', (result) => {
            const dishes = QueryableArray.from(result.dishes);
            const categories = QueryableArray.from(result.categories);    
            const extendedDishes = dishes.map((dish) => {
                const category = categories.find((cat) => cat.id === dish.category);
                const extendedDish: IExtendedDish = {} as IExtendedDish;   

                Object.assign<IExtendedDish, IDish>(extendedDish, dish);    
                extendedDish.categoryName = category ? category.name : 'Unknown';
                extendedDish.id = dish.uuid; // ensure id is preserved, as id is the primary key in the database;
                return extendedDish;
            });
            return extendedDishes; 
        });
           
        logger('Extended dishes:', extendedDishes);
        logger('Extended dishes count:', extendedDishes.length);
         extendedDishes.forEach(async (dish) => {
            logger("importing", dish);
                await this.storage.insert('menu', dish);
            
        });   
        logger('Import completed');
        return extendedDishes.length;
    }

    /**
     * Executes a series of commands to interact with the storage system.
     * 
     * This method performs the following operations:
     * 1. Retrieves all dishes from the storage and logs the first dish.
     * 2. Creates a query to filter dishes with a price greater than 10, skips the first 15 dishes,
     *    takes the next 10, and orders them by price.
     * 3. Updates the price of the queried dishes to 100 and saves the changes to the storage.
     * 4. Retrieves the updated dishes from the storage and logs the dishes with a price of 100.
     * 
     * @async
     * @returns {Promise<void>} A promise that resolves when all operations are complete.
     */
    async runCommands() {
        
        const allDishes = await this.storage.all<IExtendedDish>('menu');
        //logger(allDishes); // log all dishes

        const firstDish = allDishes.first() ;
        logger("first dish",firstDish);

        // just a stupid test to see if the query works
        const aQuery = allDishes.skip(15).take(10).where((dish) => dish.price > 10).orderBy((dish) => dish.price);
    
        logger("aQueryResults ", aQuery);

        // we can also use the query to update the data
        aQuery.forEach((dish) => {
            dish.price = 100;
            this.storage.update('menu', dish);
        });

        // we nedd to save the changes to the storage
        await this.storage.save(); // save the changes to the storage
        console.log("saved changes to storage");

        // we can also query the collection and async, again and display the results

        const updatedDishes = await this.storage.all<IExtendedDish>('menu');
        
        // just give me dishes with price = 100 then!
        const updatedDishesQuery = updatedDishes.where((dish) => dish.price === 100);
        logger("updatedDishesQuery", updatedDishesQuery);

    
    }
    
    /**
     * Initializes an instance of the class, setting up offline storage with a specified provider.
     * The constructor configures the storage provider and initializes the storage.
     * If initialization fails, it creates a new storage collection, imports data, and saves the storage.
     *
     * @remarks
     * - The storage provider is configurable and can be replaced with different implementations.
     * - Handles both successful and failed initialization scenarios.
     *
     * @throws Will log an error if storage initialization fails.
     */
    constructor() {


        const providerConfig:IProviderConfig = {
            // interceptor:new WebApiInterceptor({
            //     baseUrl:"/api"
            // })
        };

        const provider = new LocalStorageProvider(providerConfig);
        //const provider = new IndexedDBProvider

        this.storage = new OfflineStorage(provider, 'menu');
        this.storage.init().then(async () => {
            logger('LocalStorage initialized');
            await this.runCommands();
        }
        ).catch(async () => {
            logger('LocalStorage initialization failed, creating new storage');
            this.storage.addCollection<IExtendedDish>('menu');
            await this.importData();
            await this.runCommands();
            this.storage.save();
            await this.runCommands();
        });
    }

   
}

document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()

});