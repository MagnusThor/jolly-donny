import {
  FileSystemProvider,
  IProviderConfig,
  OfflineStorage,
} from '../src/index';
import { IExtendedDish } from './fake-api/IExtendedDish';

const logger = (...args: any[]) => {
        const p = document.createElement("p");
        p.textContent = JSON.stringify(args);
        document.querySelector("#output")?.prepend(p);
};

export class TestClint {
    storage!: OfflineStorage;
    async init() {
        
    
    }
    
    constructor() {


        const providerConfig:IProviderConfig = {
        };

        const provider = new FileSystemProvider(providerConfig);


        document.querySelector("button#init")?.addEventListener("click", async () => {
            this.storage = new OfflineStorage(provider, 'menu');
            this.storage.init().then(async () => {
                logger('FileSystemStorage initialized');


                document.querySelector("button#save")?.removeAttribute("disabled");

                // all data

                const allDishes = await this.storage.all<IExtendedDish>('menu');
                logger('All dishes:', allDishes.length);


                const quesyReult = allDishes.where( pre => pre.price > 100).take(5);

                logger('Query result:', quesyReult.length);



                const randomDish = allDishes[ Math.floor(Math.random() * allDishes.length)];


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