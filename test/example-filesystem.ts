import {
  FileSystemProvider,
  IOfflineStorageProvider,
  IProviderConfig,
  OfflineStorage,
} from '../src/index';
import {
  IExendedCategory,
  IExtendedDish,
  IMenu,
} from './fake-api/IExtendedDish';

const logger = (...args: any[]) => {
    const p = document.createElement("p");
    p.textContent = JSON.stringify(args);
    document.querySelector("#output")?.prepend(p);
};

/**
 * Parses the provided JSON content and maps specific collections (e.g., dishes and categories)
 * to their corresponding entries in the loaded results.
 *
 * @param content - The JSON string content to be parsed.
 * @param providerInstance - An instance of the offline storage provider.
 * @param loadedResults - The preloaded menu data containing dishes and categories.
 * @returns A map containing the parsed collections, such as 'dishes' and 'categories', 
 *          if they exist in the parsed content.
 */
export const dishFileParser = (
    content: string,
    providerInstance: IOfflineStorageProvider,
    loadedResults: IMenu
): Map<string, any> => {
    const collections = new Map<string, any>();
   
    if (Array.isArray(loadedResults.dishes)) {
        collections.set('dishes', loadedResults.dishes);
    }
    if (Array.isArray(loadedResults.categories)) {
        collections.set('categories', loadedResults.categories);
    }
    return collections;
};


export class TestClint {
    storage!: OfflineStorage;
    async init() {


    }

    constructor() {

        const providerConfig: IProviderConfig = {
            parser: dishFileParser
        };

        const provider = new FileSystemProvider(providerConfig);

        document.querySelector("button#init")?.addEventListener("click", async () => {
            this.storage = new OfflineStorage(provider, 'menu');
            this.storage.init().then(async () => {
                logger('FileSystemStorage initialized');


                document.querySelector("button#save")?.removeAttribute("disabled");

                // all data

                const allDishes = await this.storage.all<IExtendedDish>('dishes');
                logger('Number of dished loaded:', allDishes.length);


                const allCategories = await this.storage.all<IExendedCategory>('categories');
                logger('Number of categories loaded:', allCategories.length);


                const randomDish = allDishes[Math.floor(Math.random() * allDishes.length)];


                logger('Random dish:', randomDish);

                // modify the price of the random dish
                randomDish.price = 1000;

                this.storage.update("menu", randomDish).then(() => {
                    logger('Random dish updated:', randomDish);


                });

                logger('Random dish after modification:', randomDish);





            }
            ).catch(async (err) => {
                logger('FileSystemStorage initialization failed, creating new storage');
                console.error(err);
                this.storage.addCollection<IExtendedDish>('menu');

            });

        });

        document.querySelector("button#save")?.addEventListener("click", async () => {
            this.storage.save().then(() => {
                logger('FileSystemStorage saved successfully');
            }).catch((err) => {
                logger('Error saving', err);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()

});